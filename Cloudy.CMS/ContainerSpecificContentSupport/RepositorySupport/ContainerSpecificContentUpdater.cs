﻿using Cloudy.CMS.ContentTypeSupport;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Cloudy.CMS.ContentSupport.Serialization;
using Cloudy.CMS.DocumentSupport;
using Cloudy.CMS.ContentSupport;
using Cloudy.CMS.ContentSupport.RepositorySupport.ListenerSupport;

namespace Cloudy.CMS.ContainerSpecificContentSupport.RepositorySupport
{
    public class ContainerSpecificContentUpdater : IContainerSpecificContentUpdater
    {
        IDocumentUpdater DocumentUpdater { get; }
        IContentTypeProvider ContentTypeRepository { get; }
        ISaveListenerProvider SaveListenerProvider { get; }
        IContentSerializer ContentSerializer { get; }

        public ContainerSpecificContentUpdater(IDocumentUpdater documentUpdater, IContentTypeProvider contentTypeRepository, ISaveListenerProvider saveListenerProvider, IContentSerializer contentSerializer)
        {
            DocumentUpdater = documentUpdater;
            ContentTypeRepository = contentTypeRepository;
            SaveListenerProvider = saveListenerProvider;
            ContentSerializer = contentSerializer;
        }

        public void Update(IContent content, string container)
        {
            UpdateAsync(content, container).WaitAndUnwrapException();
        }

        public async Task UpdateAsync(IContent content, string container)
        {
            if (content.Id == null)
            {
                throw new InvalidOperationException($"This content cannot be updated as it doesn't seem to exist (Id is null). Did you mean to use IContentCreator?");
            }

            var contentType = ContentTypeRepository.Get(content.ContentTypeId);

            if (contentType == null)
            {
                throw new InvalidOperationException($"This content has no content type (or rather its base class has no [ContentType] attribute)");
            }

            foreach (var saveListener in SaveListenerProvider.GetFor(content))
            {
                saveListener.BeforeSave(content);
            }

            var document = ContentSerializer.Serialize(content, contentType);

            await DocumentUpdater.UpdateAsync(container, content.Id, document);

        }
    }
}
