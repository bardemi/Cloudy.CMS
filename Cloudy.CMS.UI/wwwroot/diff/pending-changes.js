import html from '../util/html.js';
import Blade from '../components/blade/blade.js';
import ListItem from '../components/list/list-item.js';
import stateManager from '../edit-content/state-manager.js';
import contentTypeProvider from '../data/content-type-provider.js';
import nameGetter from '../data/name-getter.js';

function PendingChanges({ renderIf }) {
    if (!renderIf) {
        return;
    }

    const states = stateManager.states;
    const groups = contentTypeProvider
        .getAll()
        .map(c => ({ contentType: c, changes: states.filter(s => s.contentReference.contentTypeId == c.id) }))
        .filter(g => g.changes.length);

    const getSubText = (state, contentType) => state.remove ? 'Slated for removal' : state.contentId ? `Changed fields: ${state.changedFields.length}` : `New ${contentType.lowerCaseName} (created ${state.referenceDate.toLocaleString()})`;
    const renderItems = (states, contentType) => states.map(state => html`<${ListItem} text=${nameGetter.getNameOfState(state, contentType)} subtext=${getSubText(state, contentType)} onclick=${() => setDiffData(state.change)} />`)

    return html`
        <${Blade} title='Pending changes' onClose=${() => setShowDiffBlade(false)}>
            <cloudy-ui-blade-content>
                ${!groups.length ? html`<cloudy-ui-list-sub-header>No more pending changes<//>` : null}
                ${groups.length ? groups.map(group => html`${groups.length > 1 ?
                    html`<cloudy-ui-list-sub-header>${group.contentType.name}<//>` : null}${renderItems(group.changes, group.contentType)}`) : null}
            <//>
            <cloudy-ui-blade-footer>
                <cloudy-ui-button tabindex="0" class="primary" style="margin-left: auto;" disabled=${!groups.length} onclick=${() => saveChanges()}>Save</cloudy-ui-button>
            </cloudy-ui-blade-footer>
        <//>
    `;
}

export default PendingChanges;