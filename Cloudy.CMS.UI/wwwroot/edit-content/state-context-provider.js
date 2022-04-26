import html from '../util/html.js';
import StateContext from './state-context.js';
import { useEffect, useState } from '../lib/preact.hooks.module.js';
import stateManager from './state-manager.js';

function StateContextProvider({ children }) {
    const [totalChanges, setTotalChanges] = useState(stateManager.totalChanges());

    useEffect(() => {
        const callback = () => {
            console.log('change!');
            setTotalChanges(stateManager.totalChanges());
        };
        stateManager.onChange(callback);

        return () => {
            stateManager.offChange(callback);
        };
    }, []);

    return html`
        <${StateContext.Provider} value=${totalChanges}>
            ${children}
        <//>
    `;
}

export default StateContextProvider;
