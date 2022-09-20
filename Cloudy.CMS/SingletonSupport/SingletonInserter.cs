﻿using Cloudy.CMS.ContentSupport;
using Cloudy.CMS.ContentSupport.RepositorySupport;
using Cloudy.CMS.ContentTypeSupport;
using Cloudy.CMS.InitializerSupport;
using System;
using System.Collections.Generic;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Linq;

namespace Cloudy.CMS.SingletonSupport
{
    public class SingletonInserter : IInitializer
    {
        ISingletonProvider SingletonProvider { get; }
        ISingletonGetter SingletonGetter { get; }
        IContentTypeProvider ContentTypeProvider { get; }
        IContentCreator ContentCreator { get; }

        public SingletonInserter(ISingletonProvider singletonProvider, ISingletonGetter singletonGetter, IContentTypeProvider contentTypeProvider, IContentCreator contentCreator)
        {
            SingletonProvider = singletonProvider;
            SingletonGetter = singletonGetter;
            ContentTypeProvider = contentTypeProvider;
            ContentCreator = contentCreator;
        }

        public async Task InitializeAsync()
        {
            foreach (var singleton in SingletonProvider.GetAll())
            {
                var contentType = ContentTypeProvider.Get(singleton.ContentTypeId);
                var content = await SingletonGetter.GetAsync(contentType.Type).ConfigureAwait(false);

                if (content != null)
                {
                    continue;
                }

                content = Activator.CreateInstance(contentType.Type);

                await ContentCreator.CreateAsync(content).ConfigureAwait(false);
            }
        }
    }
}
