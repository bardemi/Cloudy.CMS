﻿using Cloudy.CMS.ContentTypeSupport;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Cloudy.CMS.ContentSupport.Serialization
{
    public class ContentJsonConverter<T> : JsonConverter<T> where T : class
    {
        IContentTypeProvider ContentTypeProvider { get; }

        public ContentJsonConverter(IContentTypeProvider contentTypeProvider)
        {
            ContentTypeProvider = contentTypeProvider;
        }

        public override T Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            if (reader.TokenType != JsonTokenType.StartObject)
            {
                return null;
            }

            reader.Read();
            if (reader.TokenType != JsonTokenType.PropertyName)
            {
                return null;
            }
            var typePropertyName = reader.GetString();
            if (typePropertyName != "Type")
            {
                return null;
            }

            reader.Read();
            if (reader.TokenType != JsonTokenType.String)
            {
                return null;
            }

            var contentTypeId = reader.GetString();
            var contentType = ContentTypeProvider.Get(contentTypeId);

            if (contentType == null)
            {
                return null;
            }

            reader.Read();
            if (reader.TokenType != JsonTokenType.PropertyName)
            {
                return null;
            }
            var valuePropertyName = reader.GetString();
            if (valuePropertyName != "Value")
            {
                return null;
            }

            reader.Read();
            if (reader.TokenType != JsonTokenType.StartObject)
            {
                return null;
            }

            var content = (T)Activator.CreateInstance(contentType.Type);
            var properties = contentType.Type
                .GetProperties()
                .Where(p => !p.GetIndexParameters().Any() && p.GetGetMethod() != null && !Attribute.IsDefined(p, typeof(JsonIgnoreAttribute)))
                .ToDictionary(p => p.Name, p => p);
            
            while (reader.Read())
            {
                if (reader.TokenType == JsonTokenType.EndObject)
                {
                    reader.Read();
                    if (reader.TokenType != JsonTokenType.EndObject)
                    {
                        return null;
                    }

                    return content;
                }

                if (reader.TokenType != JsonTokenType.PropertyName)
                {
                    return null;
                }

                var propertyName = reader.GetString();

                if (string.IsNullOrWhiteSpace(propertyName))
                {
                    return null;
                }

                reader.Read();

                if(properties.TryGetValue(propertyName, out var property))
                {
                    var value = JsonSerializer.Deserialize(ref reader, property.PropertyType, options);
                    property.SetValue(content, value);
                }
            }

            return content;
        }

        public override void Write(Utf8JsonWriter writer, T value, JsonSerializerOptions options)
        {
            var contentType = ContentTypeProvider.Get(value.GetType());

            if (contentType == null)
            {
                writer.WriteNullValue();
                return;
            }

            writer.WriteStartObject();
            writer.WriteString("Type", contentType.Id);
            writer.WritePropertyName("Value");
            writer.WriteStartObject();

            var properties = contentType.Type.GetProperties().Where(p => !p.GetIndexParameters().Any() && p.GetGetMethod() != null && !Attribute.IsDefined(p, typeof(JsonIgnoreAttribute)));
            foreach (var property in properties)
            {
                writer.WritePropertyName(property.Name);
                JsonSerializer.Serialize(writer, property.GetValue(value), property.PropertyType, options);
            }
            writer.WriteEndObject();
            writer.WriteEndObject();
        }
    }
}
