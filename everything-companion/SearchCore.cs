using System.Collections.Concurrent;
using System.Globalization;
using System.Security.Cryptography;

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

public enum SearchModifiedFilter
{
    Any,
    Today,
    ThisWeek,
    ThisMonth,
    Last7Days,
    Last30Days
}

public enum SearchSizeFilter
{
    Any,
    UpTo100Kb,
    From100KbTo1Mb,
    From1MbTo16Mb,
    From16MbTo128Mb,
    Over128Mb
}

public enum SearchMatchMode
{
    Contains,
    Exact,
    StartsWith
}

public sealed record SearchRequest(
    string Query,
    SearchQueryType Type,
    int Limit,
    string Extension,
    SearchModifiedFilter Modified,
    SearchSizeFilter Size,
    string Location,
    SearchMatchMode Match
);

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

public sealed record CompanionSessionResponse(string Token, DateTimeOffset ExpiresAt);

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
    public const int MaximumLocationLength = 260;
    public const int MaximumExtensionLength = 12;
    public const int MaximumExtensionCount = 12;

    public static SearchRequest Normalize(
        string? query,
        string? type,
        int? limit,
        string? extension,
        string? modified,
        string? size,
        string? location,
        string? match)
    {
        return new SearchRequest(
            NormalizeQuery(query),
            NormalizeType(type),
            NormalizeLimit(limit),
            NormalizeExtension(extension),
            NormalizeModified(modified),
            NormalizeSize(size),
            NormalizeLocation(location),
            NormalizeMatch(match)
        );
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

        if (normalized.Contains('"', StringComparison.Ordinal))
        {
            throw new SearchRequestException("The search query cannot contain a double quote.");
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

    public static string NormalizeExtension(string? extension)
    {
        string normalized = (extension ?? string.Empty).Trim().ToLower(CultureInfo.InvariantCulture);
        if (normalized.Length == 0 || normalized == "any")
        {
            return string.Empty;
        }

        string[] parts = normalized.Split(
            [';', ',', ' '],
            StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries
        );

        if (parts.Length == 0 || parts.Length > MaximumExtensionCount)
        {
            throw new SearchRequestException($"Choose between 1 and {MaximumExtensionCount} file extensions.");
        }

        List<string> safeExtensions = new(parts.Length);
        foreach (string rawPart in parts)
        {
            string part = rawPart.TrimStart('.');
            if (part.Length is < 1 or > MaximumExtensionLength || !part.All(char.IsLetterOrDigit))
            {
                throw new SearchRequestException("File extensions may contain only letters and numbers.");
            }

            if (!safeExtensions.Contains(part, StringComparer.OrdinalIgnoreCase))
            {
                safeExtensions.Add(part);
            }
        }

        return string.Join(';', safeExtensions);
    }

    public static SearchModifiedFilter NormalizeModified(string? modified)
    {
        string normalized = (modified ?? "any").Trim().ToLower(CultureInfo.InvariantCulture);

        return normalized switch
        {
            "" or "any" => SearchModifiedFilter.Any,
            "today" => SearchModifiedFilter.Today,
            "thisweek" => SearchModifiedFilter.ThisWeek,
            "thismonth" => SearchModifiedFilter.ThisMonth,
            "last7days" => SearchModifiedFilter.Last7Days,
            "last30days" => SearchModifiedFilter.Last30Days,
            _ => throw new SearchRequestException("The modified-date filter is not supported.")
        };
    }

    public static SearchSizeFilter NormalizeSize(string? size)
    {
        string normalized = (size ?? "any").Trim().ToLower(CultureInfo.InvariantCulture);

        return normalized switch
        {
            "" or "any" => SearchSizeFilter.Any,
            "upto100kb" => SearchSizeFilter.UpTo100Kb,
            "100kbto1mb" => SearchSizeFilter.From100KbTo1Mb,
            "1mbto16mb" => SearchSizeFilter.From1MbTo16Mb,
            "16mbto128mb" => SearchSizeFilter.From16MbTo128Mb,
            "over128mb" => SearchSizeFilter.Over128Mb,
            _ => throw new SearchRequestException("The file-size filter is not supported.")
        };
    }

    public static string NormalizeLocation(string? location)
    {
        string normalized = (location ?? string.Empty).Trim();
        if (normalized.Length == 0)
        {
            return string.Empty;
        }

        if (normalized.Length > MaximumLocationLength)
        {
            throw new SearchRequestException($"The location must be {MaximumLocationLength} characters or fewer.");
        }

        if (normalized.Any(char.IsControl) || normalized.Contains('"', StringComparison.Ordinal))
        {
            throw new SearchRequestException("The location contains an invalid character.");
        }

        normalized = normalized.Replace('/', '\\');
        if (normalized.Length < 2 || !char.IsLetter(normalized[0]) || normalized[1] != ':')
        {
            throw new SearchRequestException("The location must begin with a Windows drive letter, for example C:\\Users.");
        }

        return normalized;
    }

    public static SearchMatchMode NormalizeMatch(string? match)
    {
        string normalized = (match ?? "contains").Trim().ToLower(CultureInfo.InvariantCulture);

        return normalized switch
        {
            "" or "contains" => SearchMatchMode.Contains,
            "exact" => SearchMatchMode.Exact,
            "startswith" => SearchMatchMode.StartsWith,
            _ => throw new SearchRequestException("The name-match filter must be contains, exact, or startswith.")
        };
    }
}

public static class EverythingSearchQueryBuilder
{
    public static string Build(SearchRequest request)
    {
        List<string> parts = new(7)
        {
            request.Match switch
            {
                SearchMatchMode.Exact => $"exact:{Quote(request.Query)}",
                SearchMatchMode.StartsWith => $"startwith:{Quote(request.Query)}",
                _ => Quote(request.Query)
            }
        };

        if (request.Type == SearchQueryType.File)
        {
            parts.Add("file:");
        }
        else if (request.Type == SearchQueryType.Folder)
        {
            parts.Add("folder:");
        }

        if (request.Extension.Length > 0)
        {
            parts.Add($"ext:{request.Extension}");
        }

        string? modifiedFilter = request.Modified switch
        {
            SearchModifiedFilter.Today => "dm:today",
            SearchModifiedFilter.ThisWeek => "dm:thisweek",
            SearchModifiedFilter.ThisMonth => "dm:thismonth",
            SearchModifiedFilter.Last7Days => "dm:last7days",
            SearchModifiedFilter.Last30Days => "dm:last30days",
            _ => null
        };
        if (modifiedFilter is not null)
        {
            parts.Add(modifiedFilter);
        }

        string? sizeFilter = request.Size switch
        {
            SearchSizeFilter.UpTo100Kb => "size:<=100kb",
            SearchSizeFilter.From100KbTo1Mb => "size:>100kb size:<=1mb",
            SearchSizeFilter.From1MbTo16Mb => "size:>1mb size:<=16mb",
            SearchSizeFilter.From16MbTo128Mb => "size:>16mb size:<=128mb",
            SearchSizeFilter.Over128Mb => "size:>128mb",
            _ => null
        };
        if (sizeFilter is not null)
        {
            parts.Add(sizeFilter);
        }

        if (request.Location.Length > 0)
        {
            string location = request.Location.TrimEnd('\\') + "\\";
            parts.Add(Quote(location));
        }

        return string.Join(' ', parts);
    }

    private static string Quote(string value) => $"\"{value}\"";
}

public static class LocalOriginPolicy
{
    public const string AllowedOriginContextKey = "EverythingCompanion.AllowedOrigin";

    public static readonly string[] DefaultAllowedOrigins =
    [
        "https://organizeyourpc.com",
        "https://www.organizeyourpc.com",
        "http://127.0.0.1:4173",
        "http://localhost:4173"
    ];

    public static HashSet<string> CreateAllowedOriginSet(IEnumerable<string> origins)
    {
        HashSet<string> allowedOrigins = new(StringComparer.OrdinalIgnoreCase);

        foreach (string origin in origins)
        {
            string? normalized = NormalizeOrigin(origin);
            if (normalized is not null)
            {
                allowedOrigins.Add(normalized);
            }
        }

        return allowedOrigins;
    }

    public static bool IsAllowedOrigin(string? origin, IReadOnlySet<string> allowedOrigins)
    {
        string? normalized = NormalizeOrigin(origin);
        return normalized is not null && allowedOrigins.Contains(normalized);
    }

    public static string? NormalizeOrigin(string? origin)
    {
        if (string.IsNullOrWhiteSpace(origin) || origin.Equals("null", StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        if (!Uri.TryCreate(origin.Trim(), UriKind.Absolute, out Uri? parsedOrigin))
        {
            return null;
        }

        if (parsedOrigin.Scheme is not ("http" or "https"))
        {
            return null;
        }

        if ((parsedOrigin.AbsolutePath != string.Empty && parsedOrigin.AbsolutePath != "/") ||
            !string.IsNullOrEmpty(parsedOrigin.Query) ||
            !string.IsNullOrEmpty(parsedOrigin.Fragment) ||
            !string.IsNullOrEmpty(parsedOrigin.UserInfo))
        {
            return null;
        }

        return parsedOrigin.GetLeftPart(UriPartial.Authority).TrimEnd('/');
    }
}

public sealed class CompanionSessionStore
{
    public const string HeaderName = "X-Everything-Session";
    public const string ExpiresHeaderName = "X-Everything-Session-Expires";

    private sealed record SessionEntry(string Origin, DateTimeOffset ExpiresAt);

    private readonly ConcurrentDictionary<string, SessionEntry> _sessions = new(StringComparer.Ordinal);
    private readonly TimeSpan _sessionLifetime;
    private readonly TimeProvider _timeProvider;

    public CompanionSessionStore(TimeSpan sessionLifetime, TimeProvider? timeProvider = null)
    {
        if (sessionLifetime <= TimeSpan.Zero)
        {
            throw new ArgumentOutOfRangeException(nameof(sessionLifetime));
        }

        _sessionLifetime = sessionLifetime;
        _timeProvider = timeProvider ?? TimeProvider.System;
    }

    public CompanionSessionResponse Create(string origin)
    {
        string normalizedOrigin = LocalOriginPolicy.NormalizeOrigin(origin)
            ?? throw new ArgumentException("A valid origin is required.", nameof(origin));
        DateTimeOffset now = _timeProvider.GetUtcNow();
        RemoveExpired(now);

        string token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
        DateTimeOffset expiresAt = now.Add(_sessionLifetime);
        _sessions[token] = new SessionEntry(normalizedOrigin, expiresAt);

        return new CompanionSessionResponse(token, expiresAt);
    }

    public bool IsValid(string? origin, string? token)
    {
        string? normalizedOrigin = LocalOriginPolicy.NormalizeOrigin(origin);
        string normalizedToken = (token ?? string.Empty).Trim();

        if (normalizedOrigin is null || normalizedToken.Length == 0)
        {
            return false;
        }

        if (!_sessions.TryGetValue(normalizedToken, out SessionEntry? session))
        {
            return false;
        }

        DateTimeOffset now = _timeProvider.GetUtcNow();
        if (session.ExpiresAt <= now)
        {
            _sessions.TryRemove(normalizedToken, out _);
            return false;
        }

        return session.Origin.Equals(normalizedOrigin, StringComparison.OrdinalIgnoreCase);
    }

    private void RemoveExpired(DateTimeOffset now)
    {
        foreach (KeyValuePair<string, SessionEntry> item in _sessions)
        {
            if (item.Value.ExpiresAt <= now)
            {
                _sessions.TryRemove(item.Key, out _);
            }
        }
    }
}

public static class SearchResultPrivacy
{
    public static SearchResult Redact(SearchResult result)
    {
        return result with { Path = CreateDisplayPath(result.Path) };
    }

    public static string CreateDisplayPath(string? path)
    {
        string trimmedPath = (path ?? string.Empty)
            .Trim()
            .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

        if (trimmedPath.Length == 0)
        {
            return string.Empty;
        }

        string name = Path.GetFileName(trimmedPath);
        if (string.IsNullOrWhiteSpace(name))
        {
            return "…";
        }

        string? parentPath = Path.GetDirectoryName(trimmedPath);
        string parentName = string.IsNullOrWhiteSpace(parentPath)
            ? string.Empty
            : Path.GetFileName(parentPath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar));

        return string.IsNullOrWhiteSpace(parentName)
            ? Path.Combine("…", name)
            : Path.Combine("…", parentName, name);
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
