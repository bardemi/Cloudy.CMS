﻿import { useState, useEffect } from '../lib/preact.hooks.module.js';
import html from '../util/html.js';
import nameGetter from '../data/name-getter.js';
import Urls from './urls.js';
import Form from './form.js';
import stateManager from './state-manager.js';
import contentTypeProvider from '../data/content-type-provider.js';

function EditContent({ contentReference, onClose }) {
    if (!contentReference) {
        return;
    }

    const contentType = contentTypeProvider.get(contentReference.contentTypeId);

    const state = stateManager.getState(contentReference);

    var hasChanges = false;

    return html`
        <cloudy-ui-blade>
            <cloudy-ui-blade-title>
                <cloudy-ui-blade-title-text>${(
            contentReference.keys ?
                `Edit ${nameGetter.getNameOf(content, contentType)}` :
                `New ${contentType.name}`
        )}<//>
                <cloudy-ui-blade-toolbar>
                    <${Urls} contentReference=${contentReference}/>
                <//>
                <cloudy-ui-blade-close onclick=${() => onClose()}><//>
            <//>
            <cloudy-ui-blade-content>
                <${Form} contentReference=${contentReference} state=${state}/>
            <//>
            <cloudy-ui-blade-footer style="">
                <cloudy-ui-button disabled=${!hasChanges} style="margin-left: auto;" onclick=${() => reviewChanges()}>Review changes</cloudy-ui-button>
                <cloudy-ui-button class="primary" disabled=${!hasChanges} style="margin-left: 10px;" onclick=${() => saveNow()}>Save now</cloudy-ui-button>
            </cloudy-ui-blade-footer>
        <//>
    `;
}

export default EditContent;
