using System.IO.Compression;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using NutrientOfficeTemplating.Models;

namespace NutrientOfficeTemplating.Services;

/// <param name="Section">
/// The <c>{{#section}}</c> this placeholder sits inside, or null at the top level.
/// Loop-body fields are bare names, so nesting can only be known from position.
/// </param>
public sealed record ScannedPlaceholder(string Name, string Kind, string? Section = null);

/// <summary>
/// Reads the {{...}} markers straight out of an OOXML package so an uploaded template
/// can be described — and a starter data model scaffolded — without involving the SDK.
/// </summary>
public static class PlaceholderScanner
{
    // Office writes text in parts that differ per format; these are the ones that
    // can carry placeholder text.
    private static readonly string[] TextPartPrefixes =
    [
        "word/", "xl/", "ppt/"
    ];

    /// <summary>The delimiter pair the Nutrient samples and our fixtures use.</summary>
    public const string DefaultStart = "{{";
    public const string DefaultEnd = "}}";

    private static readonly Regex DefaultMarker = BuildMarker(DefaultStart, DefaultEnd);

    /// <summary>
    /// Builds the marker pattern for a delimiter pair. Delimiters are user-supplied, so
    /// they're escaped rather than interpolated raw.
    /// </summary>
    private static Regex BuildMarker(string start, string end) => new(
        $@"{Regex.Escape(start)}\s*(?<sigil>[#/^%]?)\s*(?<name>[A-Za-z0-9_.\[\]]+)\s*{Regex.Escape(end)}",
        RegexOptions.Compiled);

    /// <summary>
    /// Extracts placeholders in document order, de-duplicated, from the OOXML parts.
    /// </summary>
    public static IReadOnlyList<ScannedPlaceholder> Scan(
        byte[] documentBytes, string? start = null, string? end = null)
    {
        Regex marker = start is null && end is null
            ? DefaultMarker
            : BuildMarker(start ?? DefaultStart, end ?? DefaultEnd);

        Dictionary<string, ScannedPlaceholder> found = [];
        List<string> order = [];

        using MemoryStream ms = new(documentBytes);
        using ZipArchive zip = new(ms, ZipArchiveMode.Read);

        // Parts are visited in a stable order so results don't shuffle between runs.
        foreach (ZipArchiveEntry entry in zip.Entries
                     .Where(e => e.FullName.EndsWith(".xml", StringComparison.OrdinalIgnoreCase))
                     .Where(e => TextPartPrefixes.Any(p =>
                         e.FullName.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
                     .OrderBy(e => e.FullName, StringComparer.Ordinal))
        {
            using StreamReader reader = new(entry.Open());
            string xml = VisibleText(reader.ReadToEnd());

            // Tracks the open {{#section}} stack so a bare name can be attributed to
            // the section containing it.
            Stack<string> openSections = new();

            foreach (Match match in marker.Matches(xml))
            {
                string sigil = match.Groups["sigil"].Value;
                string name = match.Groups["name"].Value;

                if (sigil == "/")
                {
                    // Only pop when it actually closes the section we're in; a
                    // stray close tag shouldn't corrupt the stack.
                    if (openSections.Count > 0 && openSections.Peek() == name)
                    {
                        openSections.Pop();
                    }
                    continue;
                }

                // `{{#name}}` is a section: an array repeats it, a boolean shows or
                // hides it. The template alone can't say which, so it's labelled for
                // what it is rather than guessed at.
                string kind = sigil switch
                {
                    "#" => "section",
                    "^" => "inverted",
                    "%" => "image",
                    _ => "value"
                };

                string? parent = openSections.Count > 0 ? openSections.Peek() : null;

                if (kind is "section" or "inverted")
                {
                    openSections.Push(name);
                }

                if (found.TryGetValue(name, out ScannedPlaceholder? existing))
                {
                    // A name seen as both a value and a section is a section.
                    if (existing.Kind == "value" && kind != "value")
                    {
                        found[name] = existing with { Kind = kind };
                    }
                    continue;
                }

                found[name] = new ScannedPlaceholder(name, kind, parent);
                order.Add(name);
            }
        }

        return [.. order.Select(n => found[n])];
    }

    /// <summary>
    /// Whether the given delimiter pair matches the template's own markers.
    /// </summary>
    /// <remarks>
    /// The engine matches on the delimiters from the JSON <c>config</c>. If those don't
    /// match what the template was authored with, nothing is substituted and the output
    /// silently keeps its raw markers — so the pair has to be checked, not assumed.
    /// <para>
    /// "Does this pair match anything" is not sufficient: inside <c>{{name}}</c> the
    /// substring <c>{name}}</c> is a genuine match for <c>{</c> … <c>}}</c>. Nor can a
    /// pair be rejected merely for sitting next to a brace — adjacent markers like
    /// <c>{{fee}}{{/items}}</c> legitimately do that. So the test compares the marker
    /// *text* the pair finds against the raw text it spans: a correct pair consumes the
    /// whole marker, a too-short one leaves delimiter characters behind.
    /// </para>
    /// </remarks>
    public static bool UsesDelimiters(byte[] documentBytes, string start, string end)
    {
        if (string.IsNullOrEmpty(start) || string.IsNullOrEmpty(end)) return false;

        Regex marker = BuildMarker(start, end);
        bool sawMarker = false;

        using MemoryStream ms = new(documentBytes);
        using ZipArchive zip = new(ms, ZipArchiveMode.Read);

        foreach (ZipArchiveEntry entry in zip.Entries
                     .Where(e => e.FullName.EndsWith(".xml", StringComparison.OrdinalIgnoreCase))
                     .Where(e => TextPartPrefixes.Any(p =>
                         e.FullName.StartsWith(p, StringComparison.OrdinalIgnoreCase))))
        {
            using StreamReader reader = new(entry.Open());
            string xml = VisibleText(reader.ReadToEnd());

            foreach (Match match in marker.Matches(xml))
            {
                sawMarker = true;

                // Walk outward: if the character just outside the match repeats the
                // delimiter's own leading/trailing character, the configured delimiter
                // is a truncation of the real one.
                if (match.Index > 0 && xml[match.Index - 1] == start[0] && start[0] == start[^1])
                {
                    return false;
                }

                int after = match.Index + match.Length;
                if (after < xml.Length && xml[after] == end[^1] && end[0] == end[^1])
                {
                    return false;
                }
            }
        }

        return sawMarker;
    }

    private static readonly Regex TextNode = new(
        @"<(?:\w+:)?t(?:\s[^>]*)?>(?<text>[^<]*)</(?:\w+:)?t>",
        RegexOptions.Compiled);

    /// <summary>
    /// Pulls the visible text out of the OOXML text nodes, entity-decoded.
    /// </summary>
    /// <remarks>
    /// Matching the raw XML would miss any delimiter containing a character XML escapes:
    /// <c>&lt;&lt;name&gt;&gt;</c> is stored as <c>&amp;lt;&amp;lt;name…</c>, so a regex
    /// for a literal <c>&lt;&lt;</c> never fires. Concatenating the decoded text nodes
    /// also reunites a marker Word split across runs.
    /// </remarks>
    private static string VisibleText(string xml)
    {
        System.Text.StringBuilder text = new();

        foreach (Match node in TextNode.Matches(xml))
        {
            text.Append(System.Net.WebUtility.HtmlDecode(node.Groups["text"].Value));
        }

        return text.ToString();
    }

    /// <summary>
    /// Guesses the delimiter pair a template was authored with, by trying the pairs in
    /// common use. Returns null when none of them match.
    /// </summary>
    public static (string Start, string End)? DetectDelimiters(byte[] documentBytes)
    {
        (string Start, string End)[] candidates =
        [
            (DefaultStart, DefaultEnd),
            ("{", "}"),
            ("${", "}"),
            ("<<", ">>"),
            ("[[", "]]"),
            ("%", "%")
        ];

        foreach ((string start, string end) in candidates)
        {
            if (UsesDelimiters(documentBytes, start, end)) return (start, end);
        }

        return null;
    }

    /// <summary>
    /// Builds a starter data model from scanned placeholders, so an uploaded template
    /// arrives with a fillable skeleton rather than an empty editor.
    /// </summary>
    public static string ScaffoldModel(
        IReadOnlyList<ScannedPlaceholder> placeholders,
        string? start = null,
        string? end = null)
    {
        JsonObject model = [];

        // A section containing other placeholders repeats over an array; one that
        // contains none is a boolean toggle. Nesting comes from the scan, not a guess.
        HashSet<string> repeating =
        [
            .. placeholders
                .Where(p => p.Section is not null)
                .Select(p => p.Section!)
        ];

        // Top-level entries first, so a section's array exists before its fields.
        foreach (ScannedPlaceholder placeholder in placeholders.Where(p => p.Section is null))
        {
            Assign(model, placeholder.Name, Scaffold(placeholder, repeating));
        }

        // Then the fields belonging to each repeating section, onto its first element.
        foreach (ScannedPlaceholder placeholder in placeholders.Where(p => p.Section is not null))
        {
            if (model[placeholder.Section!] is JsonArray array
                && array.Count > 0
                && array[0] is JsonObject element)
            {
                element[placeholder.Name] ??= Scaffold(placeholder, repeating);
            }
            else
            {
                // The section turned out not to be an array (a nested conditional,
                // say) — keep the field rather than dropping it silently.
                Assign(model, placeholder.Name, Scaffold(placeholder, repeating));
            }
        }

        JsonObject root = new()
        {
            // The scaffold declares the delimiters the template actually uses, so the
            // model it produces works without the user having to discover them.
            ["config"] = new JsonObject
            {
                ["delimiter"] = new JsonObject
                {
                    ["start"] = start ?? DefaultStart,
                    ["end"] = end ?? DefaultEnd
                }
            },
            ["model"] = model
        };

        return root.ToJsonString(new System.Text.Json.JsonSerializerOptions { WriteIndented = true });
    }

    /// <summary>The starter value for one placeholder, by kind.</summary>
    private static JsonNode? Scaffold(ScannedPlaceholder placeholder, HashSet<string> repeating) =>
        placeholder.Kind switch
        {
            "section" => repeating.Contains(placeholder.Name)
                ? new JsonArray(new JsonObject())
                : JsonValue.Create(true),
            "inverted" => JsonValue.Create(false),
            "image" => new JsonObject
            {
                ["_type"] = "image",
                ["source"] = "base64",
                ["format"] = "png",
                ["data"] = "",
                ["altText"] = ""
            },
            _ => JsonValue.Create("")
        };

    /// <summary>Writes a dotted path into the object graph, creating parents as needed.</summary>
    private static void Assign(JsonObject root, string path, JsonNode? value)
    {
        string[] parts = path.Split('.', StringSplitOptions.RemoveEmptyEntries);
        JsonObject cursor = root;

        for (int i = 0; i < parts.Length - 1; i++)
        {
            if (cursor[parts[i]] is JsonObject child)
            {
                cursor = child;
            }
            else
            {
                JsonObject created = [];
                cursor[parts[i]] = created;
                cursor = created;
            }
        }

        string leaf = parts[^1];
        // Never clobber a value already scaffolded (e.g. a loop seen before its fields).
        cursor[leaf] ??= value;
    }

    /// <summary>Maps a file extension onto a supported format, or null when unsupported.</summary>
    public static OfficeFormat? DetectFormat(string fileName) =>
        Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".docx" => OfficeFormat.Docx,
            ".xlsx" => OfficeFormat.Xlsx,
            ".pptx" => OfficeFormat.Pptx,
            _ => null
        };
}
