using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Portfolio.Api;

namespace Portfolio.Api.Tests;

public sealed class ApiTests(ApiTests.Factory factory) : IClassFixture<ApiTests.Factory>
{
    public sealed class Factory : WebApplicationFactory<Program>
    {
        public FakeInbox Inbox { get; } = new();

        protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder) =>
            builder.UseEnvironment("Production")
                .ConfigureTestServices(services => services.AddSingleton<IContactInbox>(Inbox));
    }

    public sealed class FakeInbox : IContactInbox
    {
        public List<ContactRequest> Messages { get; } = [];

        public Task SaveAsync(ContactRequest message, CancellationToken ct)
        {
            Messages.Add(message);
            return Task.CompletedTask;
        }
    }

    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Health_returns_ok()
    {
        var response = await _client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Portfolio_returns_the_shared_content()
    {
        var response = await _client.GetAsync("/api/portfolio");
        response.EnsureSuccessStatusCode();
        Assert.Equal("application/json", response.Content.Headers.ContentType?.MediaType);

        using var doc = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("Azaruddin A M", doc.RootElement.GetProperty("profile").GetProperty("name").GetString());
        Assert.True(doc.RootElement.GetProperty("openSource").GetArrayLength() >= 2);
    }

    [Fact]
    public async Task Contact_accepts_a_valid_message()
    {
        var response = await _client.PostAsJsonAsync("/api/contact",
            new { name = " Asha ", email = "asha@example.com", message = "Would love to talk about a role." });

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);
        Assert.Contains(factory.Inbox.Messages, m => m.Name == "Asha");
    }

    [Fact]
    public async Task Contact_rejects_an_invalid_message()
    {
        var response = await _client.PostAsJsonAsync("/api/contact",
            new { name = "", email = "not-an-email", message = "short" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.Contains("email", body);
        Assert.Contains("message", body);
    }

    [Fact]
    public async Task Cors_allows_the_portfolio_site_only()
    {
        var allowed = new HttpRequestMessage(HttpMethod.Get, "/api/portfolio");
        allowed.Headers.Add("Origin", "https://azaruddin.velouraone.in");
        var allowedResponse = await _client.SendAsync(allowed);
        Assert.Equal("https://azaruddin.velouraone.in",
            allowedResponse.Headers.GetValues("Access-Control-Allow-Origin").Single());

        var other = new HttpRequestMessage(HttpMethod.Get, "/api/portfolio");
        other.Headers.Add("Origin", "https://evil.example");
        var otherResponse = await _client.SendAsync(other);
        Assert.False(otherResponse.Headers.Contains("Access-Control-Allow-Origin"));
    }
}
