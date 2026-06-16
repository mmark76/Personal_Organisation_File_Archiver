using System.Runtime.InteropServices;
using System.Text;

namespace EverythingCompanion;

internal sealed class EverythingSdkBackend : IEverythingSearchBackend
{
    private readonly EverythingSdkApi? _api;

    public EverythingSdkBackend()
    {
        _api = EverythingSdkApi.TryLoad();
    }

    public string Name => "sdk";

    public bool IsAvailable => _api is not null && _api.IsLoaded;

    public Task<IReadOnlyList<SearchResult>> SearchAsync(SearchRequest request, CancellationToken cancellationToken)
    {
        if (_api is null || !_api.IsLoaded)
        {
            throw new EverythingBackendUnavailableException("The Everything SDK is not available.");
        }

        IReadOnlyList<SearchResult> results = _api.Search(request, cancellationToken);
        return Task.FromResult(results);
    }

    private sealed class EverythingSdkApi
    {
        private delegate void SetSearchDelegate(string search);
        private delegate void SetMatchBoolDelegate(bool value);
        private delegate void SetMaxDelegate(uint max);
        private delegate bool QueryDelegate(bool wait);
        private delegate uint GetNumResultsDelegate();
        private delegate uint GetResultFullPathNameDelegate(uint index, StringBuilder builder, uint size);
        private delegate bool IsFolderResultDelegate(uint index);

        private readonly nint _libraryHandle;
        private readonly SetSearchDelegate _setSearch;
        private readonly SetMatchBoolDelegate _setMatchCase;
        private readonly SetMatchBoolDelegate _setMatchWholeWord;
        private readonly SetMatchBoolDelegate _setMatchPath;
        private readonly SetMatchBoolDelegate _setRegex;
        private readonly SetMaxDelegate _setMax;
        private readonly QueryDelegate _query;
        private readonly GetNumResultsDelegate _getNumResults;
        private readonly GetResultFullPathNameDelegate _getResultFullPathName;
        private readonly IsFolderResultDelegate _isFolderResult;

        private EverythingSdkApi(nint libraryHandle)
        {
            _libraryHandle = libraryHandle;
            _setSearch = GetDelegate<SetSearchDelegate>("Everything_SetSearchW");
            _setMatchCase = GetDelegate<SetMatchBoolDelegate>("Everything_SetMatchCase");
            _setMatchWholeWord = GetDelegate<SetMatchBoolDelegate>("Everything_SetMatchWholeWord");
            _setMatchPath = GetDelegate<SetMatchBoolDelegate>("Everything_SetMatchPath");
            _setRegex = GetDelegate<SetMatchBoolDelegate>("Everything_SetRegex");
            _setMax = GetDelegate<SetMaxDelegate>("Everything_SetMax");
            _query = GetDelegate<QueryDelegate>("Everything_QueryW");
            _getNumResults = GetDelegate<GetNumResultsDelegate>("Everything_GetNumResults");
            _getResultFullPathName = GetDelegate<GetResultFullPathNameDelegate>("Everything_GetResultFullPathNameW");
            _isFolderResult = GetDelegate<IsFolderResultDelegate>("Everything_IsFolderResult");
        }

        public bool IsLoaded => _libraryHandle != nint.Zero;

        public static EverythingSdkApi? TryLoad()
        {
            foreach (string candidatePath in GetCandidateLibraryPaths())
            {
                if (!File.Exists(candidatePath))
                {
                    continue;
                }

                try
                {
                    return new EverythingSdkApi(NativeLibrary.Load(candidatePath));
                }
                catch
                {
                    // Try the next candidate path.
                }
            }

            return null;
        }

        public IReadOnlyList<SearchResult> Search(SearchRequest request, CancellationToken cancellationToken)
        {
            _setSearch(request.Query);
            _setMatchCase(false);
            _setMatchWholeWord(false);
            _setMatchPath(false);
            _setRegex(false);
            _setMax((uint)request.Limit);

            if (!_query(true))
            {
                throw new EverythingBackendUnavailableException("The Everything SDK query did not complete successfully.");
            }

            uint totalResults = _getNumResults();
            if (totalResults == 0)
            {
                return Array.Empty<SearchResult>();
            }

            int resultCapacity = totalResults > int.MaxValue
                ? request.Limit
                : Math.Min(request.Limit, (int)totalResults);
            List<SearchResult> results = new(resultCapacity);

            for (uint index = 0; index < totalResults && results.Count < request.Limit; index++)
            {
                cancellationToken.ThrowIfCancellationRequested();

                bool isFolder = _isFolderResult(index);
                if (request.Type == SearchQueryType.File && isFolder)
                {
                    continue;
                }

                if (request.Type == SearchQueryType.Folder && !isFolder)
                {
                    continue;
                }

                string path = GetResultPath(index);
                string name = Path.GetFileName(path.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));
                if (string.IsNullOrWhiteSpace(name))
                {
                    name = path;
                }

                results.Add(new SearchResult(name, path, isFolder ? SearchResultKind.Folder : SearchResultKind.File));
            }

            return results;
        }

        private string GetResultPath(uint index)
        {
            StringBuilder buffer = new(1024);

            while (true)
            {
                buffer.Clear();
                uint copied = _getResultFullPathName(index, buffer, (uint)buffer.Capacity);
                if (copied == 0)
                {
                    return string.Empty;
                }

                if (copied < buffer.Capacity - 1)
                {
                    return buffer.ToString(0, (int)copied);
                }

                buffer.EnsureCapacity(buffer.Capacity * 2);
            }
        }

        private TDelegate GetDelegate<TDelegate>(string exportName) where TDelegate : Delegate
        {
            nint export = NativeLibrary.GetExport(_libraryHandle, exportName);
            return Marshal.GetDelegateForFunctionPointer<TDelegate>(export);
        }

        private static IEnumerable<string> GetCandidateLibraryPaths()
        {
            string baseDirectory = AppContext.BaseDirectory;
            string? programFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string? programFilesX86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);

            string dllName = Environment.Is64BitProcess ? "Everything64.dll" : "Everything.dll";

            yield return Path.Combine(baseDirectory, dllName);

            if (!string.IsNullOrWhiteSpace(programFiles))
            {
                yield return Path.Combine(programFiles, "Everything", dllName);
                yield return Path.Combine(programFiles, "voidtools", dllName);
            }

            if (!string.IsNullOrWhiteSpace(programFilesX86))
            {
                yield return Path.Combine(programFilesX86, "Everything", "Everything.dll");
            }
        }
    }
}
