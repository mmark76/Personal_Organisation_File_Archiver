using System.Globalization;
using System.Net;

namespace EverythingCompanion;

public enum SearchQueryType
{
    All,
    File,
    Folder
}

public enum SearchResultKind
{
    File,
    Folder
}

public sealed record SearchRequest(string Query, SearchQueryType Type, int Limit);

public sealed record SearchResult(string Name, string Path, SearchResultKind Kind);

public sealed record SearchResponse(
    string Source,
    string Query,
    SearchQueryType Type,
    int Limit,
    int Count,
    IReadOnlyList<SearchResult> Results
);

public sealed record HealthResponse(
    string Status,
    string Service,
    bool EverythingAvailable,
    string Backend,
    string Message
);

public sealed class SearchRequestException : Exception
{
    public int StatusCode { get; }

    public SearchRequestException(string message, int statusCode = StatusCodes.Status400BadRequest) : base(message)
    {
        StatusCode = statusCode;
    }
}

public static class SearchRequestValidator
{
    public const int DefaultLimit = 20;
    public const int MaximumLimit = 50;
    public const int MaximumQueryLength = 256;

    public static SearchRequest Normalize(string? query, string? type, int? limit)
    {
        string normalizedQuery = NormalizeQuery(query);
        SearchQueryType normalizedType = NormalizeType(type);
        int normalizedLimit = NormalizeLimit(limit);

        return new SearchRequest(normalizedQuery, normalizedType, normalizedLimit);
    }

    public static string NormalizeQuery(string? query)
    {
        string normalized = (query ?? string.Empty).Trim();

        if (normalized.Length == 0)
        {
          throw new SearchRequestException("A search query is required.");
        }

        if (normalized.Length > MaximumQueryLength)
        {
            throw new SearchRequestException($"The search query must be {MaximumQueryLength} characters or fewer.");
        }

        if (normalized.Any(char.IsControl))
        {
            throw new SearchRequestException("The search query contains an invalid control character.");
        }

        if (normalized.StartsWith("-", StringComparison.Ordinal) || normalized.StartsWith("/", StringComparison.Ordinal))
        {
            throw new SearchRequestException("The search query cannot start with a command-style prefix.");
        }

        return normalized;
    }

    public static SearchQueryType NormalizeType(string? type)
    {
        string normalizedType = (type ?? "all").Trim().ToLower(CultureInfo.InvariantCulture);

        return normalizedType switch
        {
            "" => SearchQueryType.All,
            "all" => SearchQueryType.All,
            "file" => SearchQueryType.File,
            "folder" => SearchQueryType.Folder,
            _ => throw new SearchRequestException("The search type must be all, file, or folder.")
        };
    }

    public static int NormalizeLimit(int? limit)
    {
        int requestedLimit = limit ?? DefaultLimit;

        if (requestedLimit < 1)
        {
            return 1;
        }

        if (requestedLimit > MaximumLimit)
        {
            return MaximumLimit;
        }

        return requestedLimit;
    }
}

public static class LocalOriginPolicy
{
    public static bool IsAllowedOrigin(string? origin)
    {
        if (string.IsNullOrWhiteSpace(origin) || origin.Equals("null", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (!Uri.TryCreate(origin, UriKind.Absolute, out Uri? parsedOrigin))
        {
            return false;
        }

        if (parsedOrigin.Scheme is not ("http" or "https"))
        {
            return false;
        }

        return parsedOrigin.IsLoopback || parsedOrigin.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase);
    }
}

public interface IEverythingSearchBackend
{
    string Name { get; }

    bool IsAvailable { get; }

    Task<IReadOnlyList<SearchResult>> SearchAsync(SearchRequest request, CancellationToken cancellationToken);
}

public sealed record SearchExecutionResult(string Backend, IReadOnlyList<SearchResult> Results);

public sealed class EverythingSearchFacade
{
    private readonly IReadOnlyList<IEverythingSearchBackend> _backends;

    public EverythingSearchFacade(params IEverythingSearchBackend[] backends)
    {
        _backends = backends.Where(backend => backend is not null).ToArray();
    }

    public bool IsAvailable => _backends.Any(backend => backend.IsAvailable);

    public string GetPreferredBackendName()
    {
        return _backends.FirstOrDefault(backend => backend.IsAvailable)?.Name ?? "unavailable";
    }

    public async Task<SearchExecutionResult> SearchAsync(SearchRequest request, CancellationToken cancellationToken)
    {
        Exception? lastError = null;

        foreach (IEverythingSearchBackend backend in _backends)
        {
            if (!backend.IsAvailable)
            {
                continue;
            }

            try
            {
                IReadOnlyList<SearchResult> results = await backend.SearchAsync(request, cancellationToken).ConfigureAwait(false);
                return new SearchExecutionResult(backend.Name, results);
            }
            catch (EverythingBackendUnavailableException ex)
            {
                lastError = ex;
            }
            catch (DllNotFoundException ex)
            {
                lastError = ex;
            }
            catch (EntryPointNotFoundException ex)
            {
                lastError = ex;
            }
        }

        throw new EverythingBackendUnavailableException("Everything search is not available on this computer.", lastError);
    }
}

public sealed class EverythingBackendUnavailableException : Exception
{
    public EverythingBackendUnavailableException(string message, Exception? innerException = null) : base(message, innerException)
    {
    }
}
