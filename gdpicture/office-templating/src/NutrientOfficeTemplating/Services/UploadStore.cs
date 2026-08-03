using Microsoft.Extensions.Caching.Memory;
using NutrientOfficeTemplating.Models;

namespace NutrientOfficeTemplating.Services;

public sealed record UploadedTemplate(
    string Id,
    string FileName,
    OfficeFormat Format,
    byte[] Bytes,
    IReadOnlyList<ScannedPlaceholder> Placeholders,
    string ScaffoldedModel);

/// <summary>
/// Holds uploaded templates in memory for the length of a working session. A demo that
/// scales to zero has nowhere durable to put them, and they are not worth persisting —
/// so they simply expire.
/// </summary>
public sealed class UploadStore(IMemoryCache cache)
{
    private static readonly TimeSpan Lifetime = TimeSpan.FromMinutes(30);

    /// <summary>Caps how much a single upload can occupy, and the total across uploads.</summary>
    public const long MaxUploadBytes = 10 * 1024 * 1024;

    public UploadedTemplate Add(string fileName, OfficeFormat format, byte[] bytes)
    {
        // Templates aren't obliged to use {{ }} — detect what this one was authored with
        // so a custom-delimiter template is understood rather than rejected as empty.
        (string Start, string End) delimiters =
            PlaceholderScanner.DetectDelimiters(bytes)
            ?? (PlaceholderScanner.DefaultStart, PlaceholderScanner.DefaultEnd);

        IReadOnlyList<ScannedPlaceholder> placeholders =
            PlaceholderScanner.Scan(bytes, delimiters.Start, delimiters.End);
        string scaffold = PlaceholderScanner.ScaffoldModel(
            placeholders, delimiters.Start, delimiters.End);

        UploadedTemplate upload = new(
            Id: $"upload-{Guid.NewGuid():N}"[..15],
            FileName: fileName,
            Format: format,
            Bytes: bytes,
            Placeholders: placeholders,
            ScaffoldedModel: scaffold);

        cache.Set(Key(upload.Id), upload, new MemoryCacheEntryOptions
        {
            SlidingExpiration = Lifetime,
            Size = bytes.Length
        });

        return upload;
    }

    public UploadedTemplate? Find(string id) =>
        cache.TryGetValue(Key(id), out UploadedTemplate? upload) ? upload : null;

    private static string Key(string id) => $"upload::{id}";
}
