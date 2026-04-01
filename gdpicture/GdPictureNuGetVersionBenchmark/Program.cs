using System.Globalization;
using BenchmarkDotNet.Columns;
using BenchmarkDotNet.Configs;
using BenchmarkDotNet.Environments;
using BenchmarkDotNet.Jobs;
using BenchmarkDotNet.Reports;
using BenchmarkDotNet.Running;
using BenchmarkDotNet.Validators;
using Perfolizer.Metrology;

var filteredArgs = RemoveCustomArguments(args, new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "--baseline-version",
    "--candidate-version"
});

var baselineVersion = GetArgumentValue(args, "--baseline-version")
                      ?? Environment.GetEnvironmentVariable("GDPICTURE_BASELINE_VERSION")
                      ?? "14.3.1";

var candidateVersion = GetArgumentValue(args, "--candidate-version")
                       ?? Environment.GetEnvironmentVariable("GDPICTURE_CANDIDATE_VERSION")
                       ?? "14.4.0";

var baseJob = Job.ShortRun
    .WithRuntime(CoreRuntime.Core10_0)
    .WithGcServer(true);

var config = ManualConfig
    .Create(DefaultConfig.Instance)
    .AddJob(baseJob
        .WithId($"GdPicture {baselineVersion}")
        .WithBaseline(true)
        .WithArguments([
            new MsBuildArgument($"-p:VersionGdPicture={baselineVersion}")
        ]))
    .AddJob(baseJob
        .WithId($"GdPicture {candidateVersion}")
        .WithArguments([
            new MsBuildArgument($"-p:VersionGdPicture={candidateVersion}")
        ]))
    .WithSummaryStyle(SummaryStyle.Default.WithRatioStyle(RatioStyle.Percentage))
    .AddValidator(ExecutionValidator.FailOnError)
    .HideColumns(Column.Arguments, Column.InvocationCount, Column.UnrollFactor, Column.Gen0, Column.Gen1, Column.Gen2)
    .WithOptions(ConfigOptions.DisableOptimizationsValidator);


config.BuildTimeout = TimeSpan.FromHours(1);

BenchmarkRunner.Run<GdPictureNuGetVersionBenchmarks>(config, filteredArgs);

static string? GetArgumentValue(IReadOnlyList<string> args, string argumentName)
{
    for (int index = 0; index < args.Count - 1; index++)
    {
        if (string.Equals(args[index], argumentName, StringComparison.OrdinalIgnoreCase))
        {
            return args[index + 1];
        }
    }

    return null;
}

static string[] RemoveCustomArguments(IReadOnlyList<string> args, IReadOnlySet<string> customArgumentNames)
{
    var filteredArgs = new List<string>();

    for (int index = 0; index < args.Count; index++)
    {
        if (customArgumentNames.Contains(args[index]))
        {
            index++;
            continue;
        }

        filteredArgs.Add(args[index]);
    }

    return filteredArgs.ToArray();
}
