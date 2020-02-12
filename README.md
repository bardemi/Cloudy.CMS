![Screenshot of the Cloudy CMS admin UI.](/screenshot.png?raw=true)

# Installation

Create a new, empty ASP.NET Core web application.

Install Cloudy.CMS and Cloudy.CMS.UI from NuGet.

In Startup.cs, under ConfigureServices, do:

    services.AddControllers();
    services.AddCloudy(cloudy => cloudy.AddAdmin());

And in the Configure method, do:

    app.UseCloudyAdmin(cloudy => cloudy.Unprotect()); // NOTE: Admin UI will be publicly available!

Then visit `/Admin` for the royal tour.

To route INavigatable content (will work on /pages/MyUrlSegment etc), do:

    services.AddCloudy(cloudy => cloudy.AddContentRoute() // ...

And do:

    app.UseRouting();
    app.UseEndpoints(endpoints => {
        endpoints.MapGet("/pages/{route:contentroute}", async c => await c.Response.WriteAsync($"Hello {c.GetContentFromContentRoute().Id}"));
        endpoints.MapControllerRoute(null, "/controllertest/{route:contentroute}", new { controller = "Page", action = "Blog" });
    });

In the controller, do:

    public ActionResult Index([FromContentRoute] IContent page)

To use IHierarchical content (nested pages), you need to use a `**` wildcard like `{**route:....`

To use ASP.NET Identity (UI) with Users managed by Cloudy, create an example project with individual user accounts, and uninstall the EF stuff. Instead uf IdentityUser and IdentityUserStore, use `User` and `UserStore` and don't forget to use `Authorize()` in UseCloudyAdmin!

The UI works well with external login providers. Just follow the guides eg. [Google authentication](https://docs.microsoft.com/en-us/aspnet/core/security/authentication/social/social-without-identity?view=aspnetcore-3.0) and don't forget to use `Authorize()` in UseCloudyAdmin!

# Database

Uses inmemory database by default.

To use a physical folder with JSON documents, do: `.WithStaticFiles()` under AddCloudy.

To use MongoDB, do: `.WithMongoDatabaseConnectionStringNamed("mongo")` under AddCloudy.