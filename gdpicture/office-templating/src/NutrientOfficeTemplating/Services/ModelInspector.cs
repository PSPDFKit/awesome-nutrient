using System.Buffers.Text;
using System.Text.Json.Nodes;

namespace NutrientOfficeTemplating.Services;

/// <summary>How a placeholder fares against the data model.</summary>
public enum PlaceholderState
{
    /// <summary>The model supplies usable data.</summary>
    Ok,

    /// <summary>
    /// No data for this placeholder. The document still generates — the marker simply
    /// resolves to nothing — so this is a warning, not a blocker.
    /// </summary>
    Missing,

    /// <summary>
    /// Data is present but the wrong shape for the placeholder, e.g. a section given a
    /// string, or an image whose payload is unusable. Generation would fail or emit a
    /// broken document, so this blocks.
    /// </summary>
    Invalid
}

public sealed record PlaceholderReport(
    ScannedPlaceholder Placeholder,
    PlaceholderState State,
    string? Detail = null);

/// <summary>
/// Checks a data model against the placeholders a template declares, separating data that
/// is merely absent from data that is structurally wrong.
/// </summary>
public static class ModelInspector
{
    private static readonly string[] KnownImageSources = ["base64", "file", "bytes"];

    /// <summary>
    /// Classifies one placeholder against the model.
    /// </summary>
    /// <remarks>
    /// A field inside a section (e.g. <c>title</c> within <c>{{#deliverables}}</c>) is
    /// scoped to that section's elements, not the root — so it's checked against the
    /// array entries. A section with no data at all is reported against its own name.
    /// </remarks>
    public static PlaceholderReport Inspect(JsonObject model, ScannedPlaceholder placeholder)
    {
        // Scoped to a section: look on the section's elements.
        if (placeholder.Section is not null)
        {
            return Resolve(model, placeholder.Section) switch
            {
                JsonArray array => InspectSectionField(array, placeholder),
                // A boolean section has no elements to carry fields; nothing to check.
                JsonValue value when IsBoolean(value) => Ok(placeholder),
                // The section itself is absent — reported against the section, not here.
                _ => Ok(placeholder)
            };
        }

        JsonNode? node = Resolve(model, placeholder.Name);

        if (node is null)
        {
            return new PlaceholderReport(placeholder, PlaceholderState.Missing,
                "No value in the data model.");
        }

        return placeholder.Kind switch
        {
            "section" => InspectSection(node, placeholder),
            "inverted" => InspectInverted(node, placeholder),
            "image" => InspectImage(node, placeholder),
            _ => InspectValue(node, placeholder)
        };
    }

    private static PlaceholderReport InspectSectionField(
        JsonArray array, ScannedPlaceholder placeholder)
    {
        // An empty section is legitimate — it renders nothing.
        if (array.Count == 0) return Ok(placeholder);

        int missing = 0;
        foreach (JsonNode? element in array)
        {
            if (element is not JsonObject entry)
            {
                return new PlaceholderReport(placeholder, PlaceholderState.Invalid,
                    $"\"{placeholder.Section}\" must be an array of objects.");
            }

            if (entry[placeholder.Name] is null) missing += 1;
        }

        return missing == 0
            ? Ok(placeholder)
            : new PlaceholderReport(placeholder, PlaceholderState.Missing,
                $"Absent from {missing} of {array.Count} \"{placeholder.Section}\" entries.");
    }

    /// <summary>
    /// `{{#name}}` is both the repeat and the conditional form: an array repeats the
    /// block, a boolean shows or hides it. Anything else the engine can't act on.
    /// </summary>
    private static PlaceholderReport InspectSection(JsonNode node, ScannedPlaceholder placeholder)
    {
        if (node is JsonArray || IsBoolean(node)) return Ok(placeholder);

        return new PlaceholderReport(placeholder, PlaceholderState.Invalid,
            "A section needs an array (to repeat) or a boolean (to show or hide); "
            + $"found {Describe(node)}.");
    }

    private static PlaceholderReport InspectInverted(JsonNode node, ScannedPlaceholder placeholder)
    {
        // An inverted section renders when the value is false or absent. A truthy scalar
        // is meaningful too, so only a container is clearly wrong here.
        if (node is JsonObject or JsonArray)
        {
            return new PlaceholderReport(placeholder, PlaceholderState.Invalid,
                $"An inverted section needs a boolean; found {Describe(node)}.");
        }

        return Ok(placeholder);
    }

    /// <summary>
    /// Image placeholders carry a configuration object. A malformed one is an error: the
    /// engine would either fail or silently insert nothing.
    /// </summary>
    private static PlaceholderReport InspectImage(JsonNode node, ScannedPlaceholder placeholder)
    {
        if (node is not JsonObject image)
        {
            return new PlaceholderReport(placeholder, PlaceholderState.Invalid,
                $"An image needs a configuration object; found {Describe(node)}.");
        }

        string? data = AsString(image["data"]);
        string? filePath = AsString(image["filePath"]);

        if (string.IsNullOrWhiteSpace(data) && string.IsNullOrWhiteSpace(filePath))
        {
            // The scaffold ships this shape with an empty "data", so it's the expected
            // "not filled in yet" state rather than a mistake.
            return new PlaceholderReport(placeholder, PlaceholderState.Missing,
                "No image payload — set \"data\" (base64) or \"filePath\".");
        }

        if (!string.IsNullOrWhiteSpace(data) && !LooksLikeBase64(data))
        {
            return new PlaceholderReport(placeholder, PlaceholderState.Invalid,
                "\"data\" is not valid base64.");
        }

        string? source = AsString(image["source"]);
        if (source is not null
            && !KnownImageSources.Contains(source, StringComparer.OrdinalIgnoreCase))
        {
            return new PlaceholderReport(placeholder, PlaceholderState.Invalid,
                $"\"source\" must be one of {string.Join(", ", KnownImageSources)}; found \"{source}\".");
        }

        if (image["width"] is JsonNode width && !IsPositiveNumber(width))
        {
            return new PlaceholderReport(placeholder, PlaceholderState.Invalid,
                "\"width\" must be a positive number.");
        }

        if (image["height"] is JsonNode height && !IsPositiveNumber(height))
        {
            return new PlaceholderReport(placeholder, PlaceholderState.Invalid,
                "\"height\" must be a positive number.");
        }

        if (AsString(image["borderColor"]) is string colour && !IsHexColour(colour))
        {
            return new PlaceholderReport(placeholder, PlaceholderState.Invalid,
                $"\"borderColor\" must be a 6-digit hex colour; found \"{colour}\".");
        }

        return Ok(placeholder);
    }

    /// <summary>
    /// A plain value is substituted as text. A container can't be, so it's an error;
    /// an empty string is simply empty.
    /// </summary>
    private static PlaceholderReport InspectValue(JsonNode node, ScannedPlaceholder placeholder)
    {
        if (node is JsonObject or JsonArray)
        {
            return new PlaceholderReport(placeholder, PlaceholderState.Invalid,
                $"A value placeholder needs a scalar; found {Describe(node)}.");
        }

        if (node is JsonValue value
            && value.TryGetValue(out string? text)
            && string.IsNullOrEmpty(text))
        {
            return new PlaceholderReport(placeholder, PlaceholderState.Missing,
                "Empty value.");
        }

        return Ok(placeholder);
    }

    private static PlaceholderReport Ok(ScannedPlaceholder placeholder) =>
        new(placeholder, PlaceholderState.Ok);

    private static string Describe(JsonNode node) => node switch
    {
        JsonArray => "an array",
        JsonObject => "an object",
        JsonValue value when value.TryGetValue(out bool _) => "a boolean",
        JsonValue value when value.TryGetValue(out double _) => "a number",
        _ => "a string"
    };

    private static string? AsString(JsonNode? node) =>
        node is JsonValue value && value.TryGetValue(out string? text) ? text : null;

    private static bool IsBoolean(JsonNode node) =>
        node is JsonValue value && value.TryGetValue(out bool _);

    private static bool IsPositiveNumber(JsonNode node) =>
        node is JsonValue value && value.TryGetValue(out double number) && number > 0;

    private static bool IsHexColour(string colour)
    {
        string trimmed = colour.TrimStart('#');
        return trimmed.Length == 6 && trimmed.All(Uri.IsHexDigit);
    }

    /// <summary>
    /// Whether the string is decodable base64, checked without allocating a decoded copy
    /// of what may be megabytes of image data.
    /// </summary>
    private static bool LooksLikeBase64(string data)
    {
        // A data: URL is a common paste, but the engine wants the payload alone — so
        // it's reported rather than silently accepted.
        if (data.StartsWith("data:", StringComparison.OrdinalIgnoreCase)) return false;

        return Base64.IsValid(data);
    }

    /// <summary>Walks a dotted path from the model root.</summary>
    private static JsonNode? Resolve(JsonObject model, string path)
    {
        JsonNode? cursor = model;

        foreach (string part in path.Split('.', StringSplitOptions.RemoveEmptyEntries))
        {
            if (cursor is not JsonObject obj || obj[part] is null) return null;
            cursor = obj[part];
        }

        return cursor;
    }
}
