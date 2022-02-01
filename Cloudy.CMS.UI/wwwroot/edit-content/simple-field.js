
import { useContext, useEffect, useState } from '../lib/preact.hooks.module.js';
import pendingChangesContext from '../diff/pending-changes-context.js';
import html from '../util/html.js';

export default function SimpleField({ contentId, contentTypeId, path, fieldModel, readonly, value: initialValue }) {
    const [, , , getPendingValue] = useContext(pendingChangesContext);

    if (fieldModel.descriptor.embeddedFormId && !fieldModel.descriptor.isSortable) {
        wrapperTag = 'fieldset';
        labelTag = 'legend';
    }

    const emitEvent = (element, val) => element.dispatchEvent(new CustomEvent('cloudy-ui-form-change', { bubbles: true, detail: { change: { path, type: 'simple', operation: 'set', initialValue, value: val } } }))

    return html`
        <div class="cloudy-ui-form-field cloudy-ui-simple">
            <div class="cloudy-ui-form-field-label">${fieldModel.descriptor.label || fieldModel.descriptor.id}</div>
            <${fieldModel.controlType} onchange=${emitEvent} fieldModel=${fieldModel} initialValue=${getPendingValue(contentId, contentTypeId, path, initialValue)} readonly=${readonly}/>
        </div>
    `;
}