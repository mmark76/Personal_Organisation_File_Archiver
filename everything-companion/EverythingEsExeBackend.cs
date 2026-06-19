using System.Diagnostics;
using System.Text;

namespace EverythingCompanion;

internal sealed class EverythingEsExeBackend : IEverythingSearchBackend
{
    public string Name => "es.exe";

    public bool IsAvailable => ResolveExecutablePath() is not null;

    public async Task<IReadOnlyList<SearchResult>> SearchAsync(SearchRequest request, CancellationToken cancellationToken)
    {
        string? executablePath = ResolveExecutablePath();
        if (executablePath is null)
        {
            throw new EverythingBackendUnavailableException("The Everything command line tool was not found.");
        }

        ProcessStartInfo startInfo = BuildProcessStartInfo(
            executablePath,
            EverythingSearchQueryBuilder.Build(request)
        );
        using Process? process = Process.Start(startInfo);
        if (process is null)
        {
            throw new EverythingBackendUnavailableException("The Everything command line tool could not be started.");
        }

        List<SearchResult> results = new(request.Limit);
        Task<string> stderrTask = process.StandardError.ReadToEndAsync();
        Task<string?>? stdoutLineTask = process.StandardOutput.ReadLineAsync();

        while (true)
        {
            cancellationToken.ThrowIfCancellationRequested();

            if (stdoutLineTask is null)
            {
                break;
            }

            string? line = await stdoutLineTask.ConfigureAwait(false);
            if (line is null)
            {
                break;
            }

            stdoutLineTask = process.StandardOutput.ReadLineAsync();

            if (!string.IsNullOrWhiteSpace(line))
            {
                SearchResult? result = TryConvertLineToResult(line, request.Type);
                if (result is not null)
                {
                    results.Add(result);
                    if (results.Count >= request.Limit)
                    {
                        break;
                    }
                }
            }
        }

        if (!process.HasExited)
        {
            try
            {
                process.Kill(entireProcessTree: true);
            }
            catch
            {
                // Ignore cleanup failures and keep the API response limited to the collected results.
            }
        }

        try
        {
            await process.WaitForExitAsync(cancellationToken).ConfigureAwait(false);
            await stderrTask.ConfigureAwait(false);
        }
        catch
        {
            // Ignore exit wait cancellation so the caller still receives the collected results.
        }

        return results;
    }

    internal static ProcessStartInfo BuildProcessStartInfo(string executablePath, string query)
    {
        ProcessStartInfo startInfo = new()
        {
            FileName = executablePath,
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            CreateNoWindow = true,
            StandardOutputEncoding = Encoding.UTF8,
            StandardErrorEncoding = Encoding.UTF8
        };

        startInfo.ArgumentList.Add(query);
        return startInfo;
    }

    private static SearchResult? TryConvertLineToResult(string line, SearchQueryType type)
    {
        string path = line.Trim().Trim('"');
        if (path.Length == 0)
        {
            return null;
        }

        bool isFolder = Directory.Exists(path);
        bool isFile = File.Exists(path);

        if (type == SearchQueryType.File && !isFile)
        {
            return null;
        }

        if (type == SearchQueryType.Folder && !isFolder)
        {
            return null;
        }

        if (!isFolder && !isFile)
        {
            return null;
        }

        string name = Path.GetFileName(path.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));
        if (string.IsNullOrWhiteSpace(name))
        {
            name = path;
        }

        return new SearchResult(name, path, isFolder ? SearchResultKind.Folder : SearchResultKind.File);
    }

    private static string? ResolveExecutablePath()
    {
        string baseDirectory = AppContext.BaseDirectory;
        string? programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
        string? programFilesX86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);

        string[] candidates =
        [
            Path.Combine(baseDirectory, "es.exe"),
            Path.Combine(programFiles, "Everything", "es.exe"),
            Path.Combine(programFilesX86, "Everything", "es.exe"),
        ];

        return candidates.FirstOrDefault(File.Exists);
    }
}
