using System.Threading.RateLimiting;
using Portfolio.Api;

var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

builder.Services.AddProblemDetails();
builder.Services.AddSingleton<PortfolioStore>();
builder.Services.AddSingleton<IContactInbox, FileContactInbox>();
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
{
    if (builder.Environment.IsDevelopment())
    {
        // Any local dev-server port
        policy.SetIsOriginAllowed(origin => Uri.TryCreate(origin, UriKind.Absolute, out var uri) && uri.IsLoopback);
    }
    else
    {
        policy.WithOrigins(allowedOrigins);
    }
    policy.WithMethods("GET", "POST").WithHeaders("Content-Type");
}));
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("contact", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(10) }));
});

var app = builder.Build();

app.UseExceptionHandler();
app.UseCors();
app.UseRateLimiter();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.MapGet("/api/portfolio", (PortfolioStore store) =>
    Results.Text(store.Json, "application/json"));

app.MapPost("/api/contact", async (ContactRequest request, IContactInbox inbox, CancellationToken ct) =>
{
    var errors = request.Validate();
    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }
    await inbox.SaveAsync(request.Normalize(), ct);
    return Results.Accepted();
}).RequireRateLimiting("contact");

app.Run();

public partial class Program;
