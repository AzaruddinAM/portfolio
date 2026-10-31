using System.Text.Json;

namespace Portfolio.Api;

/// <summary>Holds the portfolio content (the same JSON file the Angular site ships).</summary>
public sealed class PortfolioStore
{
    public PortfolioStore()
    {
        // Copied next to the binaries by the csproj link, for both run and publish.
        var path = Path.Combine(AppContext.BaseDirectory, "Data", "portfolio.json");
        Json = File.ReadAllText(path);
        // Fail fast at startup if the content file is malformed.
        using var _ = JsonDocument.Parse(Json);
    }

    public string Json { get; }
}
