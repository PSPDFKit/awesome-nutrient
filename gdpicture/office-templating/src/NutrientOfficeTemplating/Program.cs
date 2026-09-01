using System.Text.Json;
using System.Text.Json.Nodes;
using GdPicture14;
using NutrientOfficeTemplating.Models;
using NutrientOfficeTemplating.Services;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddMemoryCache(options =>
{
    // Bounded so a stream of uploads can't exhaust the machine; entries are sized
    // by their byte length.
    options.SizeLimit = 128 * 1024 * 1024;
});
builder.Services.AddSingleton<TemplateCatalog>();
builder.Services.AddSingleton<TemplateProvider>();
builder.Services.AddSingleton<TemplatingService>();
builder.Services.AddSingleton<UploadStore>();

WebApplication app = builder.Build();

// Register the licence before any SDK call. Without a key the SDK still runs, but
// watermarks the output — which is fine for a demo.
// LicenseManager is not IDisposable — the registration is process-wide.
string licenseKey = builder.Configuration["NUTRIENT_LICENSE_KEY"] ?? string.Empty;
new LicenseManager().RegisterKEY(licenseKey);

if (string.IsNullOrWhiteSpace(licenseKey))
{
    app.Logger.LogWarning(
        "No NUTRIENT_LICENSE_KEY set — generated documents will carry an evaluation watermark.");
}

app.UseDefaultFiles();
app.UseStaticFiles();

// ---------------------------------------------------------------- helpers

// Resolves an id to either a built-in template or an uploaded one, so every endpoint
// treats the two identically.
static (byte[] Bytes, OfficeFormat Format, string Label)? Resolve(
    string id, TemplateCatalog catalog, TemplateProvider provider, UploadStore uploads)
{
    TemplateDefinition? definition = catalog.Find(id);
    if (definition is not null)
    {
        return (provider.ReadTemplate(definition), definition.Format, definition.Id);
    }

    UploadedTemplate? upload = uploads.Find(id);
    return upload is null ? null : (upload.Bytes, upload.Format, upload.Id);
}

static string ExtensionFor(OfficeFormat format) => format switch
{
    OfficeFormat.Docx => "docx",
    OfficeFormat.Xlsx => "xlsx",
    _ => "pptx"
};

static string ContentTypeFor(OfficeFormat format) => format switch
{
    OfficeFormat.Docx => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    OfficeFormat.Xlsx => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    _ => "application/vnd.openxmlformats-officedocument.presentationml.presentation"
};

// ---------------------------------------------------------------- API

// Liveness probe. Deliberately cheap — no SDK call — so it answers while a generation is
// in flight. It exists because an unlicensed .NET SDK terminates the process after an
// hour; the check lets Fly notice a dead machine and replace it rather than serve it.
app.MapGet("/healthz", () => Results.Ok(new { status = "ok" }));

// Front-end configuration. The Web SDK licence is a *client-side* key — it necessarily
// reaches the browser, which is how the SDK works. Serving it from a secret keeps it out
// of the repo and the image, and lets one image run in any environment; it does not make
// the key private.
app.MapGet("/api/config", (IConfiguration configuration) =>
{
    string webKey = configuration["NUTRIENT_WEB_LICENSE_KEY"] ?? string.Empty;

    return Results.Ok(new
    {
        webSdkLicenseKey = webKey,
        // Surfaced so the UI can explain the watermark rather than look broken.
        webSdkTrialMode = string.IsNullOrWhiteSpace(webKey),
        dotNetTrialMode = string.IsNullOrWhiteSpace(licenseKey)
    });
});

// The template catalogue, for the format switcher and template picker.
app.MapGet("/api/templates", (TemplateCatalog catalog) =>
    Results.Ok(catalog.All.Select(t => new
    {
        id = t.Id,
        format = t.Format.ToString().ToUpperInvariant(),
        title = t.Title,
        subtitle = t.Subtitle,
        features = t.Features,
        extension = t.Extension
    })));

// Metadata for one template — built-in or uploaded. Lets a permalink to an upload
// rehydrate the UI without special-casing it on the client.
app.MapGet("/api/templates/{id}/info", (string id, TemplateCatalog catalog, UploadStore uploads) =>
{
    TemplateDefinition? definition = catalog.Find(id);
    if (definition is not null)
    {
        return Results.Ok(new
        {
            id = definition.Id,
            format = definition.Format.ToString().ToUpperInvariant(),
            title = definition.Title,
            subtitle = definition.Subtitle,
            features = definition.Features,
            extension = definition.Extension,
            uploaded = false
        });
    }

    UploadedTemplate? upload = uploads.Find(id);
    if (upload is null)
    {
        return Results.NotFound(new { error = $"Unknown template '{id}'. Uploads expire after 30 minutes." });
    }

    return Results.Ok(new
    {
        id = upload.Id,
        format = upload.Format.ToString().ToUpperInvariant(),
        title = upload.FileName,
        subtitle = $"Uploaded template — {upload.Placeholders.Count} placeholders found.",
        features = new[] { "Your template" },
        extension = ExtensionFor(upload.Format),
        uploaded = true
    });
});

// The sample JSON model that pre-fills the editor.
app.MapGet("/api/templates/{id}/model", (string id, TemplateCatalog catalog, TemplateProvider provider, UploadStore uploads) =>
{
    TemplateDefinition? definition = catalog.Find(id);
    if (definition is not null)
    {
        return Results.Text(provider.ReadModel(definition), "application/json");
    }

    UploadedTemplate? upload = uploads.Find(id);
    return upload is null
        ? Results.NotFound(new { error = $"Unknown template '{id}'." })
        : Results.Text(upload.ScaffoldedModel, "application/json");
});

// The placeholders the template actually contains, read from the OOXML itself.
app.MapGet("/api/templates/{id}/placeholders", (
    string id, TemplateCatalog catalog, TemplateProvider provider, UploadStore uploads) =>
{
    var resolved = Resolve(id, catalog, provider, uploads);
    if (resolved is null)
    {
        return Results.NotFound(new { error = $"Unknown template '{id}'." });
    }

    // No config is supplied here, so read with whatever the template itself uses.
    (string Start, string End) delimiters =
        PlaceholderScanner.DetectDelimiters(resolved.Value.Bytes)
        ?? (PlaceholderScanner.DefaultStart, PlaceholderScanner.DefaultEnd);

    IReadOnlyList<ScannedPlaceholder> found =
        PlaceholderScanner.Scan(resolved.Value.Bytes, delimiters.Start, delimiters.End);

    return Results.Ok(found.Select(p => new { name = p.Name, kind = p.Kind }));
});

// The raw template file, so users can download and inspect the placeholders.
app.MapGet("/api/templates/{id}/file", (string id, TemplateCatalog catalog, TemplateProvider provider, UploadStore uploads) =>
{
    var resolved = Resolve(id, catalog, provider, uploads);
    if (resolved is null)
    {
        return Results.NotFound(new { error = $"Unknown template '{id}'." });
    }

    // "-template-empty" so an unfilled template is never mistaken for output
    // once both files are sitting in a downloads folder.
    return Results.File(
        resolved.Value.Bytes,
        ContentTypeFor(resolved.Value.Format),
        $"{resolved.Value.Label}-template-empty.{ExtensionFor(resolved.Value.Format)}");
});

// Renders the *unfilled* template to PDF, so it can be previewed at any step.
app.MapGet("/api/templates/{id}/preview", (
    string id, TemplateCatalog catalog, TemplateProvider provider, UploadStore uploads, TemplatingService templating) =>
{
    var resolved = Resolve(id, catalog, provider, uploads);
    if (resolved is null)
    {
        return Results.NotFound(new { error = $"Unknown template '{id}'." });
    }

    try
    {
        byte[] pdf = templating.PreviewAsPdf(resolved.Value.Bytes, resolved.Value.Format);
        return Results.File(pdf, "application/pdf");
    }
    catch (TemplatingException ex)
    {
        return Results.BadRequest(new { error = ex.Message, step = ex.Step, status = ex.Status.ToString() });
    }
});

// Accepts a .docx/.xlsx/.pptx, scans its placeholders and scaffolds a starter model.
app.MapPost("/api/uploads", async (HttpRequest request, UploadStore uploads) =>
{
    if (!request.HasFormContentType)
    {
        return Results.BadRequest(new { error = "Expected a multipart form upload." });
    }

    IFormCollection form = await request.ReadFormAsync();
    IFormFile? file = form.Files.GetFile("template") ?? form.Files.FirstOrDefault();

    if (file is null || file.Length == 0)
    {
        return Results.BadRequest(new { error = "No file was uploaded." });
    }

    if (file.Length > UploadStore.MaxUploadBytes)
    {
        return Results.BadRequest(new
        {
            error = $"That file is {file.Length / 1024 / 1024} MB; the limit is {UploadStore.MaxUploadBytes / 1024 / 1024} MB."
        });
    }

    OfficeFormat? format = PlaceholderScanner.DetectFormat(file.FileName);
    if (format is null)
    {
        return Results.BadRequest(new
        {
            error = "Only .docx, .xlsx and .pptx templates are supported."
        });
    }

    using MemoryStream buffer = new();
    await file.CopyToAsync(buffer);
    byte[] bytes = buffer.ToArray();

    UploadedTemplate upload;
    try
    {
        upload = uploads.Add(Path.GetFileName(file.FileName), format.Value, bytes);
    }
    catch (InvalidDataException)
    {
        // Not a readable OOXML package — most often a renamed .doc/.xls or a corrupt file.
        return Results.BadRequest(new
        {
            error = "That file isn't a readable Office document. Templates must be OOXML (.docx / .xlsx / .pptx), not the older binary formats."
        });
    }

    if (upload.Placeholders.Count == 0)
    {
        return Results.BadRequest(new
        {
            error = "No placeholders were found in that template. Add markers such as {{name}} — or any delimiters you prefer, e.g. <<name>> — and try again."
        });
    }

    return Results.Ok(new
    {
        id = upload.Id,
        fileName = upload.FileName,
        format = upload.Format.ToString().ToUpperInvariant(),
        extension = ExtensionFor(upload.Format),
        placeholders = upload.Placeholders.Select(p => new { name = p.Name, kind = p.Kind }),
        model = upload.ScaffoldedModel
    });
});

// Validates a data model against a template's placeholders without generating anything.
app.MapPost("/api/templates/{id}/validate", (
    string id, GenerateRequest request, TemplateCatalog catalog, TemplateProvider provider, UploadStore uploads) =>
{
    var resolved = Resolve(id, catalog, provider, uploads);
    if (resolved is null)
    {
        return Results.NotFound(new { error = $"Unknown template '{id}'." });
    }

    if (string.IsNullOrWhiteSpace(request.Model))
    {
        return Results.Ok(new { valid = false, error = "The data model is empty." });
    }

    JsonNode? root;
    try
    {
        root = JsonNode.Parse(request.Model);
    }
    catch (JsonException ex)
    {
        return Results.Ok(new { valid = false, error = $"Not valid JSON: {ex.Message}" });
    }

    if (root is not JsonObject obj || obj["model"] is not JsonObject model)
    {
        return Results.Ok(new
        {
            valid = false,
            error = "The JSON must have a top-level \"model\" object holding the data."
        });
    }

    // The delimiters in `config` are what the engine matches on. If they don't match the
    // template's own markers, nothing is substituted — and the failure is silent, so it
    // has to be caught here rather than after generating.
    JsonNode? delimiter = obj["config"]?["delimiter"];
    string start = delimiter?["start"]?.GetValue<string>() ?? PlaceholderScanner.DefaultStart;
    string end = delimiter?["end"]?.GetValue<string>() ?? PlaceholderScanner.DefaultEnd;

    if (!PlaceholderScanner.UsesDelimiters(resolved.Value.Bytes, start, end))
    {
        (string Start, string End)? actual = PlaceholderScanner.DetectDelimiters(resolved.Value.Bytes);

        return Results.Ok(new
        {
            valid = false,
            error = actual is null
                ? $"No placeholders in this template match the delimiters \"{start}\" … \"{end}\"."
                : $"The delimiters \"{start}\" … \"{end}\" don't match this template, which uses \"{actual.Value.Start}\" … \"{actual.Value.End}\". Nothing would be substituted.",
            placeholders = Array.Empty<object>()
        });
    }

    // Report each placeholder, read with the delimiters the user actually configured.
    // Absent data is a warning — the document still generates, the marker just resolves
    // to nothing. Data of the wrong shape is an error, because generation would fail or
    // emit something broken.
    IReadOnlyList<ScannedPlaceholder> placeholders =
        PlaceholderScanner.Scan(resolved.Value.Bytes, start, end);

    List<PlaceholderReport> reports =
        [.. placeholders.Select(p => ModelInspector.Inspect(model, p))];

    List<PlaceholderReport> invalid =
        [.. reports.Where(r => r.State == PlaceholderState.Invalid)];
    List<PlaceholderReport> missing =
        [.. reports.Where(r => r.State == PlaceholderState.Missing)];

    return Results.Ok(new
    {
        // "valid" now means "nothing structurally wrong" — it gates generation.
        valid = invalid.Count == 0,
        error = invalid.Count == 0 ? null : Summarise(invalid, "invalid"),
        warning = missing.Count == 0 ? null : Summarise(missing, "without data"),
        placeholders = reports.Select(r => new
        {
            name = r.Placeholder.Name,
            kind = r.Placeholder.Kind,
            state = r.State.ToString().ToLowerInvariant(),
            detail = r.Detail,
            // Retained so an older client still renders something sensible.
            satisfied = r.State == PlaceholderState.Ok
        })
    });
});

// Phrases a set of problem placeholders for the UI.
static string Summarise(List<PlaceholderReport> reports, string label)
{
    string names = string.Join(", ", reports.Take(5).Select(r => r.Placeholder.Name));
    string suffix = reports.Count > 5 ? "…" : "";
    string first = reports[0].Detail is null ? "" : $" {reports[0].Detail}";

    return $"{reports.Count} placeholder{(reports.Count == 1 ? "" : "s")} {label}: {names}{suffix}.{first}";
}

// Generation. Returns the Office document, and the PDF/UA rendition when asked for.
app.MapPost("/api/templates/{id}/generate", (
    string id,
    GenerateRequest request,
    TemplateCatalog catalog,
    TemplateProvider provider,
    UploadStore uploads,
    TemplatingService templating) =>
{
    var resolved = Resolve(id, catalog, provider, uploads);
    if (resolved is null)
    {
        return Results.NotFound(new { error = $"Unknown template '{id}'." });
    }

    if (string.IsNullOrWhiteSpace(request.Model))
    {
        return Results.BadRequest(new { error = "The data model is empty." });
    }

    // Fail on malformed JSON here so the user gets a parse error rather than an
    // opaque SDK status code.
    JsonNode? parsed;
    try
    {
        parsed = JsonNode.Parse(request.Model);
    }
    catch (JsonException ex)
    {
        return Results.BadRequest(new { error = $"The data model is not valid JSON: {ex.Message}" });
    }

    // Mismatched delimiters would produce a document that still shows its raw markers,
    // with an OK status from the engine. Refuse rather than hand back a broken file.
    JsonNode? config = (parsed as JsonObject)?["config"]?["delimiter"];
    string configuredStart = config?["start"]?.GetValue<string>() ?? PlaceholderScanner.DefaultStart;
    string configuredEnd = config?["end"]?.GetValue<string>() ?? PlaceholderScanner.DefaultEnd;

    if (!PlaceholderScanner.UsesDelimiters(resolved.Value.Bytes, configuredStart, configuredEnd))
    {
        (string Start, string End)? actual = PlaceholderScanner.DetectDelimiters(resolved.Value.Bytes);

        return Results.BadRequest(new
        {
            error = actual is null
                ? $"No placeholders in this template match the delimiters \"{configuredStart}\" … \"{configuredEnd}\", so nothing would be substituted."
                : $"The delimiters \"{configuredStart}\" … \"{configuredEnd}\" don't match this template, which uses \"{actual.Value.Start}\" … \"{actual.Value.End}\". Nothing would be substituted."
        });
    }

    // Structurally wrong data is refused here too, since the API can be called directly.
    // Merely absent data is allowed through — that's a warning, and the document still
    // generates with those markers resolving to nothing.
    if ((parsed as JsonObject)?["model"] is JsonObject dataModel)
    {
        List<PlaceholderReport> broken =
        [
            .. PlaceholderScanner
                .Scan(resolved.Value.Bytes, configuredStart, configuredEnd)
                .Select(p => ModelInspector.Inspect(dataModel, p))
                .Where(r => r.State == PlaceholderState.Invalid)
        ];

        if (broken.Count > 0)
        {
            return Results.BadRequest(new { error = Summarise(broken, "invalid") });
        }
    }

    try
    {
        GenerationResult result = templating.Generate(
            resolved.Value.Bytes, resolved.Value.Format, resolved.Value.Label,
            request.Model, request.IncludePdf);

        return Results.Ok(new
        {
            document = Convert.ToBase64String(result.Document),
            documentName = $"{resolved.Value.Label}-generated.{ExtensionFor(resolved.Value.Format)}",
            contentType = ContentTypeFor(resolved.Value.Format),
            pdf = result.Pdf is null ? null : Convert.ToBase64String(result.Pdf),
            pdfName = $"{resolved.Value.Label}.pdf",
            elapsedMs = result.ElapsedMs
        });
    }
    catch (TemplatingException ex)
    {
        return Results.BadRequest(new { error = ex.Message, step = ex.Step, status = ex.Status.ToString() });
    }
});

app.Run();

internal sealed record GenerateRequest(string Model, bool IncludePdf = false);
