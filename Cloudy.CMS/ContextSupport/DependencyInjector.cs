﻿using Cloudy.CMS.DependencyInjectionSupport;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Cloudy.CMS.ContextSupport
{
    public class DependencyInjector : IDependencyInjector
    {
        public void InjectDependencies(IServiceCollection services)
        {
            services.AddScoped<IContextCreator, ContextCreator>();
        }
    }
}
