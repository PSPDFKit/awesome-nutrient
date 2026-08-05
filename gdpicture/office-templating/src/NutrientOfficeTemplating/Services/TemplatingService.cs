using System.Diagnostics;
using GdPicture14;
using NutrientOfficeTemplating.Models;

namespace NutrientOfficeTemplating.Services;

public sealed class GenerationResult
{
    public required byte[] Document { get; init; }
    public byte[]? Pdf { get; init; }
    public required long ElapsedMs { get; init; }
}

/// <summary>
/// Thrown when the SDK reports a non-OK status. Carries the raw
/// <see cref="GdPictureStatus"/> so the API layer can surface it verbatim.
/// </summary>
public sealed class TemplatingException(string step, GdPictureStatus status)
    : Exception($"{step} failed: {status}")
{
    public GdPictureStatus Status { get; } = status;
    public string Step { get; } = step;
}

/// <summary>
/// Wraps <c>GdPictureOfficeTemplater</c>. The same four calls — SetTemplate, LoadFromStream,
/// Process, SaveToStream — drive DOCX, XLSX and PPTX alike; the engine detects the format
/// from the loaded file. That is why one method serves all three showcase formats.
/// </summary>
public sealed class TemplatingService(
    TemplateProvider templates,
    ILogger<TemplatingService> logger)
{
    /// <summary>
    /// Applies <paramref name="jsonModel"/> to the given template and, when
    /// <paramref name="alsoConvertToPdf"/> is set, converts the result to PDF/UA-1.
    /// </summary>
    public GenerationResult Generate(
        TemplateDefinition definition,
        string jsonModel,
        bool alsoConvertToPdf)
        => Generate(templates.ReadTemplate(definition), definition.Format, definition.Id, jsonModel, alsoConvertToPdf);

    /// <summary>
    /// Generation from raw bytes, so an uploaded template runs the identical path as a
    /// built-in one.
    /// </summary>
    public GenerationResult Generate(
        byte[] templateBytes,
        OfficeFormat format,
        string label,
        string jsonModel,
        bool alsoConvertToPdf)
    {
        long started = Stopwatch.GetTimestamp();

        byte[] generated = ApplyTemplate(templateBytes, jsonModel);

        byte[]? pdf = alsoConvertToPdf
            ? ConvertToPdfUa(generated, format)
            : null;

        long elapsedMs = (long)Stopwatch.GetElapsedTime(started).TotalMilliseconds;
        logger.LogInformation(
            "Generated {Format} template {Id} in {Elapsed}ms (pdf: {Pdf})",
            format, label, elapsedMs, alsoConvertToPdf);

        return new GenerationResult
        {
            Document = generated,
            Pdf = pdf,
            ElapsedMs = elapsedMs
        };
    }

    /// <summary>
    /// Renders an Office file to PDF without applying any data — used to preview the
    /// template (placeholders still visible) or a generated document at any step.
    /// </summary>
    public byte[] PreviewAsPdf(byte[] documentBytes, OfficeFormat format) =>
        ConvertToPdfUa(documentBytes, format);

    private static byte[] ApplyTemplate(byte[] templateBytes, string jsonModel)
    {
        using GdPictureOfficeTemplater templater = new();

        // The JSON carries both the delimiter config and the data model.
        GdPictureStatus status = templater.SetTemplate(jsonModel);
        if (status != GdPictureStatus.OK)
        {
            throw new TemplatingException("Setting the data model", status);
        }

        using MemoryStream input = new(templateBytes);
        status = templater.LoadFromStream(input);
        if (status != GdPictureStatus.OK)
        {
            throw new TemplatingException("Loading the template", status);
        }

        // Resolves scalars, dotted paths, loop sections and image placeholders.
        status = templater.Process();
        if (status != GdPictureStatus.OK)
        {
            throw new TemplatingException("Processing the template", status);
        }

        using MemoryStream output = new();
        status = templater.SaveToStream(output);
        if (status != GdPictureStatus.OK)
        {
            throw new TemplatingException("Saving the generated document", status);
        }

        return output.ToArray();
    }

    /// <summary>
    /// Converts a generated Office document to PDF/UA-1, the accessible-PDF conformance
    /// level used by the Nutrient samples.
    /// </summary>
    private static byte[] ConvertToPdfUa(byte[] documentBytes, OfficeFormat format)
    {
        using GdPictureDocumentConverter converter = new();

        // The stream overload has no auto-detect, so the format is passed explicitly.
        // It must stay open for the duration of the conversion.
        using MemoryStream input = new(documentBytes);
        GdPictureStatus status = converter.LoadFromStream(input, ToDocumentFormat(format));
        if (status != GdPictureStatus.OK)
        {
            throw new TemplatingException("Loading the generated document for conversion", status);
        }

        using MemoryStream output = new();
        status = converter.SaveAsPDF(output, PdfConformance.PDF_UA_1);
        if (status != GdPictureStatus.OK)
        {
            throw new TemplatingException("Converting to PDF/UA", status);
        }

        return output.ToArray();
    }

    // Fully qualified: GdPicture14 also has a DocumentFormat *namespace*, which
    // shadows the enum of the same name.
    private static GdPicture14.DocumentFormat ToDocumentFormat(OfficeFormat format) => format switch
    {
        OfficeFormat.Docx => GdPicture14.DocumentFormat.DocumentFormatDOCX,
        OfficeFormat.Xlsx => GdPicture14.DocumentFormat.DocumentFormatXLSX,
        OfficeFormat.Pptx => GdPicture14.DocumentFormat.DocumentFormatPPTX,
        _ => throw new ArgumentOutOfRangeException(nameof(format))
    };
}
