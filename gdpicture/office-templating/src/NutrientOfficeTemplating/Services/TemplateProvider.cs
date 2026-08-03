using NutrientOfficeTemplating.Models;

namespace NutrientOfficeTemplating.Services;

/// <summary>
/// Reads template files and their sample JSON models from the <c>Templates</c> folder
/// that ships beside the app.
/// </summary>
public sealed class TemplateProvider
{
    private readonly string _root;

    public TemplateProvider(IWebHostEnvironment environment)
    {
        _root = Path.Combine(environment.ContentRootPath, "Templates");
    }

    public byte[] ReadTemplate(TemplateDefinition definition) =>
        File.ReadAllBytes(Resolve(definition.TemplateFile));

    public string ReadModel(TemplateDefinition definition) =>
        File.ReadAllText(Resolve(definition.ModelFile));

    private string Resolve(string fileName)
    {
        string path = Path.Combine(_root, fileName);
        if (!File.Exists(path))
        {
            throw new FileNotFoundException($"Template asset '{fileName}' is missing.", path);
        }

        return path;
    }
}
