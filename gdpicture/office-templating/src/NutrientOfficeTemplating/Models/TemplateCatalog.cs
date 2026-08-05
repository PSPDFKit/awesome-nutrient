using System.Text.Json;
using System.Text.Json.Serialization;

namespace NutrientOfficeTemplating.Models;

/// <summary>
/// One of the three Office formats the templating engine handles. The engine itself is
/// format-neutral — this only picks the fixture and the output extension.
/// </summary>
public enum OfficeFormat
{
    Docx,
    Xlsx,
    Pptx
}

/// <summary>
/// A showcase template: the Office file, its sample JSON model, and the copy describing
/// which templating features it demonstrates.
/// </summary>
public sealed record TemplateDefinition(
    string Id,
    OfficeFormat Format,
    string Title,
    string Subtitle,
    string TemplateFile,
    string ModelFile,
    string[] Features)
{
    public string Extension => Format switch
    {
        OfficeFormat.Docx => "docx",
        OfficeFormat.Xlsx => "xlsx",
        OfficeFormat.Pptx => "pptx",
        _ => throw new ArgumentOutOfRangeException(nameof(Format))
    };

    public string ContentType => Format switch
    {
        OfficeFormat.Docx => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        OfficeFormat.Xlsx => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        OfficeFormat.Pptx => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        _ => throw new ArgumentOutOfRangeException(nameof(Format))
    };
}

/// <summary>The sidecar that describes a template to the UI.</summary>
internal sealed record TemplateMetadata
{
    public string? Title { get; init; }
    public string? Subtitle { get; init; }
    public string[]? Features { get; init; }

    /// <summary>Lower sorts first within a format; ties fall back to the id.</summary>
    public int Order { get; init; }
}

/// <summary>
/// The demo template library, discovered from the <c>Templates</c> folder rather than
/// hardcoded — a template is any Office file with a matching <c>.model.json</c>, so
/// adding one is dropping in files rather than editing and recompiling this class.
/// </summary>
public sealed class TemplateCatalog
{
    private static readonly JsonSerializerOptions MetadataOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        ReadCommentHandling = JsonCommentHandling.Skip
    };

    private readonly List<TemplateDefinition> _all;
    private readonly ILogger<TemplateCatalog> _logger;

    public TemplateCatalog(IWebHostEnvironment environment, ILogger<TemplateCatalog> logger)
    {
        _logger = logger;
        _all = Discover(Path.Combine(environment.ContentRootPath, "Templates"));

        _logger.LogInformation(
            "Discovered {Count} templates: {Ids}",
            _all.Count, string.Join(", ", _all.Select(t => t.Id)));
    }

    public IReadOnlyList<TemplateDefinition> All => _all;

    public TemplateDefinition? Find(string id) =>
        _all.FirstOrDefault(t => string.Equals(t.Id, id, StringComparison.OrdinalIgnoreCase));

    private List<TemplateDefinition> Discover(string root)
    {
        if (!Directory.Exists(root))
        {
            _logger.LogWarning("Templates folder {Root} does not exist.", root);
            return [];
        }

        List<(TemplateDefinition Definition, int Order)> found = [];

        foreach (string path in Directory
                     .EnumerateFiles(root)
                     .Where(p => ExtensionToFormat(Path.GetExtension(p)) is not null)
                     .OrderBy(p => p, StringComparer.Ordinal))
        {
            string id = Path.GetFileNameWithoutExtension(path);
            OfficeFormat format = ExtensionToFormat(Path.GetExtension(path))!.Value;

            string modelFile = $"{id}.model.json";
            if (!File.Exists(Path.Combine(root, modelFile)))
            {
                // A template with no data model can't be demonstrated, so it's skipped
                // rather than shown as a broken card.
                _logger.LogWarning(
                    "Skipping {Template}: no {Model} beside it.", Path.GetFileName(path), modelFile);
                continue;
            }

            TemplateMetadata meta = ReadMetadata(Path.Combine(root, $"{id}.meta.json"), id);

            found.Add((new TemplateDefinition(
                Id: id,
                Format: format,
                Title: meta.Title ?? Humanise(id),
                Subtitle: meta.Subtitle ?? string.Empty,
                TemplateFile: Path.GetFileName(path),
                ModelFile: modelFile,
                Features: meta.Features ?? []), meta.Order));
        }

        // Grouped by format in the UI, so order by format first, then the sidecar's
        // explicit order, then id — giving a stable, curated sequence.
        return
        [
            .. found
                .OrderBy(f => f.Definition.Format)
                .ThenBy(f => f.Order)
                .ThenBy(f => f.Definition.Id, StringComparer.Ordinal)
                .Select(f => f.Definition)
        ];
    }

    private TemplateMetadata ReadMetadata(string path, string id)
    {
        if (!File.Exists(path)) return new TemplateMetadata();

        try
        {
            return JsonSerializer.Deserialize<TemplateMetadata>(
                       File.ReadAllText(path), MetadataOptions)
                   ?? new TemplateMetadata();
        }
        catch (JsonException ex)
        {
            // Bad metadata shouldn't hide an otherwise working template.
            _logger.LogWarning(ex, "Ignoring malformed metadata for {Id}.", id);
            return new TemplateMetadata();
        }
    }

    private static OfficeFormat? ExtensionToFormat(string extension) =>
        extension.ToLowerInvariant() switch
        {
            ".docx" => OfficeFormat.Docx,
            ".xlsx" => OfficeFormat.Xlsx,
            ".pptx" => OfficeFormat.Pptx,
            _ => null
        };

    /// <summary>Fallback title: "offer-letter" becomes "Offer letter".</summary>
    private static string Humanise(string id)
    {
        string spaced = id.Replace('-', ' ').Replace('_', ' ');
        return spaced.Length == 0 ? id : char.ToUpperInvariant(spaced[0]) + spaced[1..];
    }
}
