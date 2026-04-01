using BenchmarkDotNet.Attributes;
using GdPicture14;

[MemoryDiagnoser]
public class GdPictureNuGetVersionBenchmarks : IDisposable
{
    private string _pdfPath = null!;
    private string _pdfToMdPath = null!;
    private GdPictureDocumentConverter? _converter;

    [GlobalSetup]
    public void GlobalSetup()
    {
        BenchmarkAssets.RegisterLicense();
        _pdfPath = BenchmarkAssets.GetAssetPath("sample.pdf");
        _pdfToMdPath = BenchmarkAssets.GetAssetPath("sample-to-md.pdf");
    }

    [IterationSetup(Targets = [nameof(RasterizePdfWithSaveAsPdf)])]
    public void SetupPdfRasterization()
    {
        _converter?.Dispose();
        _converter = new GdPictureDocumentConverter();
        BenchmarkAssets.EnsureSuccess(_converter.LoadFromFile(_pdfPath), nameof(GdPictureDocumentConverter.LoadFromFile));
    }

    [IterationCleanup(Targets = [nameof(RasterizePdfWithSaveAsPdf)])]
    public void CleanupPdfRasterization()
    {
        _converter?.Dispose();
        _converter = null;
    }

    [Benchmark(Description = "PDF Generation")]
    public void RasterizePdfWithSaveAsPdf()
    {
        if (_converter == null)
        {
            SetupPdfRasterization();
        }
        
        using var output = new MemoryStream();
        BenchmarkAssets.EnsureSuccess(_converter!.SaveAsPDF(output), nameof(GdPictureDocumentConverter.SaveAsPDF));
    }

    [Benchmark(Description = "PDF/A generation")]
    public void GeneratePdfA()
    {
        BenchmarkAssets.ConvertDocumentToPdf(_pdfPath, PdfConformance.PDF_A_2b);
    }

    [Benchmark(Description = "PDF/UA generation")]
    public void GeneratePdfUa()
    {
        BenchmarkAssets.ConvertDocumentToPdf(_pdfPath, PdfConformance.PDF_UA_1);
    }

    [Benchmark(Description = "PDF to Markdown")]
    public void ConvertPdfToMarkdown()
    {
        BenchmarkAssets.ConvertDocumentToMarkdown(_pdfToMdPath);
    }

    public void Dispose()
    {
        _converter?.Dispose();
    }
}

internal static class BenchmarkAssets
{
    private static readonly string AssetsDirectory = Path.Combine(AppContext.BaseDirectory, "assets");
    private static bool _licenseRegistered;

    public static void RegisterLicense()
    {
        if (_licenseRegistered)
        {
            return;
        }

        var licenseKey = Environment.GetEnvironmentVariable("GDPICTURE_LICENSE_KEY");
        if (string.IsNullOrWhiteSpace(licenseKey))
        {
            throw new InvalidOperationException("Set the GDPICTURE_LICENSE_KEY environment variable before running the benchmarks.");
        }

        new LicenseManager().RegisterKEY(licenseKey);
        _licenseRegistered = true;
    }

    public static string GetAssetPath(string assetName)
    {
        var assetPath = Path.Combine(AssetsDirectory, assetName);
        if (!File.Exists(assetPath))
        {
            throw new FileNotFoundException($"Benchmark asset '{assetPath}' was not found.", assetPath);
        }

        return assetPath;
    }

    public static void LoadDocument(string documentPath)
    {
        using var converter = new GdPictureDocumentConverter();
        EnsureSuccess(converter.LoadFromFile(documentPath), nameof(GdPictureDocumentConverter.LoadFromFile));
    }

    public static void ConvertDocumentToPdf(string documentPath, PdfConformance conformance)
    {
        using var converter = new GdPictureDocumentConverter();
        EnsureSuccess(converter.LoadFromFile(documentPath), nameof(GdPictureDocumentConverter.LoadFromFile));

        using var output = new MemoryStream();
        EnsureSuccess(converter.SaveAsPDF(output, conformance), nameof(GdPictureDocumentConverter.SaveAsPDF));
    }

    public static void ConvertDocumentToMarkdown(string documentPath)
    {
        using var converter = new GdPictureDocumentConverter();
        EnsureSuccess(converter.LoadFromFile(documentPath), nameof(GdPictureDocumentConverter.LoadFromFile));

        using var output = new MemoryStream();
        EnsureSuccess(converter.SaveAsMarkDown(output), nameof(GdPictureDocumentConverter.SaveAsMarkDown));
    }

    public static void EnsureSuccess(GdPictureStatus status, string operation)
    {
        if (status != GdPictureStatus.OK)
        {
            throw new InvalidOperationException($"{operation} failed with status {status}.");
        }
    }
}
