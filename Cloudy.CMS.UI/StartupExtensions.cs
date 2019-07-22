﻿using Microsoft.Extensions.DependencyInjection;
using Poetry;
using Cloudy.CMS;
using Cloudy.CMS.DocumentSupport;
using Cloudy.CMS.ContentControllerSupport;
using Cloudy.CMS.ContentSupport;
using Cloudy.CMS.ContentSupport.RepositorySupport;
using Cloudy.CMS.ContentSupport.Serialization;
using Cloudy.CMS.ContentTypeSupport;
using Cloudy.CMS.ContentTypeSupport.PropertyMappingSupport;
using Cloudy.CMS.Core;
using Cloudy.CMS.Core.ContentSupport.RepositorySupport;
using Cloudy.CMS.Mvc.Routing;
using Cloudy.CMS.Reflection;
using Cloudy.CMS.Routing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Cloudy.CMS.UI.NaggingSupport;
using Microsoft.AspNetCore.Routing;
using Cloudy.CMS.AspNetCore.ContentControllerSupport;
using Poetry.AspNetCore;
using Poetry.UI.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Poetry.InitializerSupport;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Poetry.ComponentSupport;
using Cloudy.CMS.UI.AuthorizationSupport;

namespace Cloudy.CMS.UI
{
    public static class StartupExtensions
    {
        static string DefaultManifestName { get; } = "Microsoft.Extensions.FileProviders.Embedded.Manifest.xml";

        public static CloudyConfigurator AddAdmin(this CloudyConfigurator configurator)
        {
            configurator.AddComponent<CloudyAdminComponent>();

            return configurator;
        }

        public static void AddContentRoute(this IRouteBuilder routes)
        {
            routes.Routes.Add(new ContentRoute(routes.DefaultHandler, routes.ApplicationBuilder.ApplicationServices.GetRequiredService<IContentRouter>(), routes.ApplicationBuilder.ApplicationServices.GetRequiredService<IContentTypeProvider>(), routes.ApplicationBuilder.ApplicationServices.GetRequiredService<IContentControllerFinder>()));
        }

        public static void UseCloudyAdmin(this IApplicationBuilder app, Action<CloudyAdminConfigurator> configure)
        {
            var options = new CloudyAdminOptions();

            configure(new CloudyAdminConfigurator(options));

            var authorizationService = app.ApplicationServices.GetRequiredService<IAuthorizationService>();

            if(options.AllowUnauthenticatedUsers && options.AuthorizeOptions != null)
            {
                throw new ArgumentException($"You have called both {nameof(CloudyAdminConfigurator.Authorize)}() and {nameof(CloudyAdminConfigurator.Unprotect)}(), they are mutually exclusive. You probably want to remove the latter");
            }

            var policy = 
                options.AllowUnauthenticatedUsers ?
                new AuthorizationPolicyBuilder().RequireAssertion(context => true).Build() :
                options.AuthorizeOptions != null ?
                AuthorizationPolicy.CombineAsync(app.ApplicationServices.GetRequiredService<IAuthorizationPolicyProvider>(), new List<IAuthorizeData> { options.AuthorizeOptions }).Result :
                new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();

            var path = new PathString(options.BasePath);


            app.Map(path, adminBranch =>
            {
                adminBranch.UseMiddleware<AuthorizeMiddleware>(policy);

                foreach (var component in app.ApplicationServices.GetRequiredService<IComponentProvider>().GetAll())
                {
                    if (!component.Assembly.Assembly.GetManifestResourceNames().Contains(DefaultManifestName))
                    {
                        continue;
                    }

                    adminBranch.Map(new PathString($"/{component.Id}"), componentBranch =>
                    {
                        componentBranch.UseStaticFiles(new StaticFileOptions
                        {
                            FileProvider = new ManifestEmbeddedFileProvider(component.Assembly.Assembly),
                            OnPrepareResponse = context => context.Context.Response.Headers["Cache-Control"] = "no-cache"
                        });
                    });
                }

                adminBranch.UseMvc(routes => routes.MapAreaRoute("Cloudy.CMS.Admin.MainPage", "Cloudy.CMS.Admin", string.Empty, new { controller = "MainPage", action = "Index" }));
            });
        }
    }
}