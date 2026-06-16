using System.Net;
using EverythingCompanion;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);
int port = builder.Configuration.GetValue("EverythingCompanion:Port", 51337);

builder.WebHost.ConfigureKestrel(options =>
{
    options.Listen(IPAddress.Loopback, port);
});

EverythingSearchFacade searchFacade = new(
    new EverythingSdkBackend(),
    new EverythingEsExeBackend()
);

WebApplication app = builder.Build();

app.Use(async (context, next) =>
{
    string? origin = context.Request.Headers.Origin.ToString();
    if (LocalOriginPolicy.IsAllowedOrigin(origin))
    {
        if (!string.IsNullOrWhiteSpace(origin))
        {
            context.Response.Headers.AccessControlAllowOrigin = origin!;
            context.Response.Headers["Vary"] = "Origin";
        }

        context.Response.Headers.AccessControlAllowMethods = "GET, OPTIONS";
        context.Response.Headers.AccessControlAllowHeaders = "Content-Type";
    }

    if (HttpMethods.IsOptions(context.Request.Method))
    {
        context.Response.StatusCode = StatusCodes.Status204NoContent;
        return;
    }

    await next(context);
});

app.MapGet("/api/health", () =>
{
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
});

app.MapGet("/api/search", async (HttpContext context, string? q, string? type, int? limit, CancellationToken cancellationToken) =>
{
    try
    {
        SearchRequest request = SearchRequestValidator.Normalize(q, type, limit);
        SearchExecutionResult execution = await searchFacade.SearchAsync(request, cancellationToken).ConfigureAwait(false);

        return Results.Json(new SearchResponse(
            execution.Backend,
            request.Query,
            request.Type,
            request.Limit,
            execution.Results.Count,
            execution.Results
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
});

app.Run();
