import stateManager from "../state-manager.js";

const UNCHANGED = {};

class EmbeddedBlockChangeHandler {
  setType(contentReference, path, type) {
    const state = stateManager.getState(contentReference);
    const change = stateManager.getOrCreateLatestChange(state, 'blocktype', path);

    change.date = Date.now();
    change.type = type;

    stateManager.persist(state);
  }
  getIntermediateType(state, path) {
    let type = UNCHANGED;

    for (var change of state.changes) {
      if (change['$type'] == 'blocktype' && path == change.path) {
        type = change.type;
        continue;
      }
      if (change['$type'] == 'blocktype' && path.indexOf(`${change.path}.`) == 0) {
        type = null;
        continue;
      }
    }

    if (type == UNCHANGED) {
      const referenceValue = stateManager.getReferenceValue(state, path);
      return referenceValue ? referenceValue.Type : null;
    }

    return type;
  }
}

export default new EmbeddedBlockChangeHandler();