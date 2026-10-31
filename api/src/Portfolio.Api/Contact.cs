using System.Net.Mail;
using System.Text.Json;

namespace Portfolio.Api;

public sealed record ContactRequest(string? Name, string? Email, string? Message)
{
    public Dictionary<string, string[]> Validate()
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(Name) || Name.Trim().Length > 100)
        {
            errors["name"] = ["Name is required (max 100 characters)."];
        }
        if (string.IsNullOrWhiteSpace(Email) || Email.Length > 200 || !MailAddress.TryCreate(Email.Trim(), out _))
        {
            errors["email"] = ["A valid email is required."];
        }
        var length = Message?.Trim().Length ?? 0;
        if (length is < 10 or > 4000)
        {
            errors["message"] = ["Message must be 10–4000 characters."];
        }
        return errors;
    }

    public ContactRequest Normalize() => new(Name!.Trim(), Email!.Trim(), Message!.Trim());
}

public interface IContactInbox
{
    Task SaveAsync(ContactRequest message, CancellationToken ct);
}

/// <summary>Appends each message as a JSON line under App_Data and logs it.</summary>
public sealed class FileContactInbox(IWebHostEnvironment env, ILogger<FileContactInbox> logger) : IContactInbox
{
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly string _path = Path.Combine(env.ContentRootPath, "App_Data", "messages.jsonl");

    public async Task SaveAsync(ContactRequest message, CancellationToken ct)
    {
        var line = JsonSerializer.Serialize(new { receivedAt = DateTimeOffset.UtcNow, message.Name, message.Email, message.Message });
        await _lock.WaitAsync(ct);
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(_path)!);
            await File.AppendAllTextAsync(_path, line + Environment.NewLine, ct);
        }
        finally
        {
            _lock.Release();
        }
        logger.LogInformation("Contact message received from {Email}", message.Email);
    }
}
