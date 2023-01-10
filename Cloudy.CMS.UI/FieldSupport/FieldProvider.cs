﻿using Cloudy.CMS.BlockSupport;
using Cloudy.CMS.EntityTypeSupport;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Cloudy.CMS.UI.FieldSupport
{
    public class FieldProvider : IFieldProvider
    {
        IDictionary<string, IEnumerable<FieldDescriptor>> FieldsByEntityType { get; }

        public FieldProvider(IEntityTypeProvider entityTypeProvider, IBlockTypeProvider blockTypeProvider, IFieldCreator fieldCreator)
        {
            FieldsByEntityType = entityTypeProvider.GetAll().Select(t => t.Type)
                .Concat(blockTypeProvider.GetAll())
                .ToDictionary(
                    f => f.Name,
                    f => fieldCreator.Create(f.Name)
                );
        }

        public IEnumerable<FieldDescriptor> Get(string entityType)
        {
            if (!FieldsByEntityType.ContainsKey(entityType))
            {
                return null;
            }

            return FieldsByEntityType[entityType];
        }
    }
}
