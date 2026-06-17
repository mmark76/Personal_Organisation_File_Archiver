using System.Net;
using System.Threading.RateLimiting;
using EverythingCompanion;
using Microsoft.AspNetCore.RateLimiting;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
int port = builder.Configuration.GetValue("EverythingCompanion:Port", 51337);
bool exposeFullPaths = builder.Configuration.GetValue("EverythingCompanion:ExposeFullPaths", false);
int configuredSessionMinutes = builder.Configuration.GetValue("EverythingCompanion:SessionMinutes", 15);
TimeSpan sessionLifetime = TimeSpan.FromMinutes(Math.Clamp(configuredSessionMinutes, 5, 120));

IEnumerable<string> configuredOrigins = builder.Configuration
    .GetSection("EverythingCompanion:AllowedOrigins")
    .GetChildren()
    .Select(section => section.Value)
    .Where(value => !string.IsNullOrWhiteSpace(value))
    .Cast<string>();

HashSet<string> allowedOrigins = LocalOriginPolicy.CreateAllowedOriginSet(
    LocalOriginPolicy.DefaultAllowedOrigins.Concat(configuredOrigins)
);

builder.WebHost.ConfigureKestrel(options =>
{
    options.Listen(IPAddress.Loopback, port);
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("health", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: LocalOriginPolicy.NormalizeOrigin(context.Request.Headers.Origin.ToString()) ?? "direct",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 20,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                AutoReplenishment = true
            }
        )
    );

    options.AddPolicy("search", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: LocalOriginPolicy.NormalizeOrigin(context.Request.Headers.Origin.ToString()) ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 30,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                AutoReplenishment = true
            }
        )
    );
});

EverythingSearchFacade searchFacade = new(
    new EverythingSdkBackend(),
    new EverythingEsExeBackend()
);
CompanionSessionStore sessionStore = new(sessionLifetime);

WebApplication app = builder.Build();

app.Use(async (context, next) =>
{
    bool isApiRequest = context.Request.Path.StartsWithSegments("/api");
    if (!isApiRequest)
    {
        await next(context);
        return;
    }

    string? origin = context.Request.Headers.Origin.ToString();
    string? normalizedOrigin = LocalOriginPolicy.NormalizeOrigin(origin);
    bool hasOrigin = !string.IsNullOrWhiteSpace(origin);
    bool isAllowedOrigin = normalizedOrigin is not null && allowedOrigins.Contains(normalizedOrigin);
    bool isSearchEndpoint = context.Request.Path.StartsWithSegments("/api/search");

    if ((hasOrigin && !isAllowedOrigin) || (isSearchEndpoint && !isAllowedOrigin))
    {
        context.Response.StatusCode = StatusCodes.Status403Forbidden;
        await context.Response.WriteAsJsonAsync(new
        {
            title = "Origin not allowed",
            detail = "This local companion accepts requests only from explicitly allowed application origins."
        });
        return;
    }

    if (isAllowedOrigin)
    {
        context.Items[LocalOriginPolicy.AllowedOriginContextKey] = normalizedOrigin!;
        context.Response.Headers.AccessControlAllowOrigin = normalizedOrigin!;
        context.Response.Headers["Vary"] = "Origin, Access-Control-Request-Private-Network";
        context.Response.Headers.AccessControlAllowMethods = "GET, OPTIONS";
        context.Response.Headers.AccessControlAllowHeaders =
            $"Accept, Content-Type, {CompanionSessionStore.HeaderName}";
        context.Response.Headers.AccessControlExposeHeaders =
            $"{CompanionSessionStore.HeaderName}, {CompanionSessionStore.ExpiresHeaderName}";
        context.Response.Headers.AccessControlMaxAge = "600";

        if (context.Request.Headers["Access-Control-Request-Private-Network"]
            .ToString()
            .Equals("true", StringComparison.OrdinalIgnoreCase))
        {
            context.Response.Headers["Access-Control-Allow-Private-Network"] = "true";
        }
    }

    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    if (isSearchEndpoint)
    {
        context.Response.Headers.CacheControl = "no-store";
    }

    if (HttpMethods.IsOptions(context.Request.Method))
    {
        if (!isAllowedOrigin)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return;
        }

        context.Response.StatusCode = StatusCodes.Status204NoContent;
        return;
    }

    await next(context);
});

app.UseRateLimiter();

app.MapGet("/api/health", (HttpContext context) =>
{
    if (context.Items.TryGetValue(LocalOriginPolicy.AllowedOriginContextKey, out object? originValue) &&
        originValue is string allowedOrigin)
    {
        CompanionSessionResponse session = sessionStore.Create(allowedOrigin);
        context.Response.Headers[CompanionSessionStore.HeaderName] = session.Token;
        context.Response.Headers[CompanionSessionStore.ExpiresHeaderName] =
            session.ExpiresAt.ToString("O", System.Globalization.CultureInfo.InvariantCulture);
        context.Response.Headers.CacheControl = "no-store";
    }

    bool everythingAvailable = searchFacade.IsAvailable;
    string backend = searchFacade.GetPreferredBackendName();

    return Results.Json(new HealthResponse(
        "ok",
        "EverythingCompanion",
        everythingAvailable,
        backend,
        everythingAvailable
            ? "The companion service is ready on 127.0.0.1."
            : "The companion service is running on 127.0.0.1, but Everything is not available yet."
    ));
}).RequireRateLimiting("health");

app.MapGet("/api/search", async (HttpContext context, string? q, string? type, int? limit, CancellationToken cancellationToken) =>
{
    string? origin = context.Request.Headers.Origin.ToString();
    string? sessionToken = context.Request.Headers[CompanionSessionStore.HeaderName].ToString();

    if (!sessionStore.IsValid(origin, sessionToken))
    {
        return Results.Problem(
            title: "Unauthorized",
            detail: "A valid, unexpired Everything companion session is required.",
            statusCode: StatusCodes.Status401Unauthorized
        );
    }

    try
    {
        SearchRequest request = SearchRequestValidator.Normalize(q, type, limit);
        SearchExecutionResult execution = await searchFacade.SearchAsync(request, cancellationToken).ConfigureAwait(false);
        IReadOnlyList<SearchResult> responseResults = exposeFullPaths
            ? execution.Results
            : execution.Results.Select(SearchResultPrivacy.Redact).ToArray();

        return Results.Json(new SearchResponse(
            execution.Backend,
            request.Query,
            request.Type,
            request.Limit,
            responseResults.Count,
            responseResults
        ));
    }
    catch (SearchRequestException exception)
    {
        return Results.Problem(title: "Invalid request", detail: exception.Message, statusCode: exception.StatusCode);
    }
    catch (EverythingBackendUnavailableException exception)
    {
        return Results.Problem(
            title: "Everything is unavailable",
            detail: exception.Message,
            statusCode: StatusCodes.Status503ServiceUnavailable
        );
    }
}).RequireRateLimiting("search");

app.Run();
