import Button from "../button.js";
import contentSaver from "./content-saver.js";
import PendingChangesBlade from "./pending-changes-blade.js";



/* CHANGE TRACKER */

class ChangeTracker {
    element = document.createElement('cloudy-ui-change-tracker');
    pendingChanges = [];
    changeExecutors = {
        save: contentSaver
    };
    referenceEvents = [];

    constructor(app, parentBlade) {
        this.button = new Button('No changes').setDisabled().appendTo(this.element);
        this.app = app;
        this.parentBlade = parentBlade;
        this.button.onClick(() => this.saveChange());
        this.setReferenceEvents(this.button);
        this.update();
    }
    
    setReferenceEvents(element) {
        const index = this.referenceEvents.findIndex(e => e.id === element.id);
        if (index !== -1) {
            this.referenceEvents.splice(index, 1);
        }
        this.referenceEvents.push(element);
    }

    saveChange() {
        this.app.addBladeAfter(new PendingChangesBlade(this.app, this), this.parentBlade);
    }

    save(contentId, contentTypeId, contentAsJson) {
        if (!contentId && contentId !== null) {
            throw new Error('ContentId must be null or a valid value (string, number, ...)')
        }

        const { name, value, originalValue } = contentAsJson;
        const index = this.pendingChanges.findIndex(c => c.type === 'save' && (contentId === null || c.contentId.every(function (id, i) { return id === contentId[i] })) && c.contentTypeId === contentTypeId);
        if (index === -1) {
            this.pendingChanges.push({
                type: 'save',
                contentId,
                contentTypeId,
                changedFields: value !== originalValue ? [{...contentAsJson}]: []
            });
            this.update();
            return;
        }

        const changeFieldIndex = this.pendingChanges[index].changedFields.findIndex(f => f.name === name);
        if (changeFieldIndex === -1 && value !== originalValue) {
            this.pendingChanges[index].changedFields.push(contentAsJson);
            this.update();
            return;
        }

        if (changeFieldIndex !== -1) {
            if ( value === originalValue) {
                this.pendingChanges[index].changedFields.splice(changeFieldIndex, 1);
            } else {
                this.pendingChanges[index].changedFields[changeFieldIndex].value = value;
            }
        }
        this.update();
    }

    update() {
        let changeCount = 0;
        this.pendingChanges.forEach(c => {
            changeCount = changeCount + c.changedFields.length;
        });
        const changeText = changeCount <= 0 ? 'No changes': (changeCount > 1 ? `${changeCount} changes` : '1 change');
        this.referenceEvents.forEach(element => {
            element.setText(changeCount <= 0 ? (element.initText || changeText) : changeText);
            element.setDisabled(changeCount <= 0);
            element.setPrimary(changeCount > 0);
        })
    }

    reset(contentId, contentTypeId) {
        const index = this.pendingChanges.findIndex(c => (contentId === null || c.contentId.every(function (id, i) { return id === contentId[i] })) && c.contentTypeId === contentTypeId);
        if (index !== -1) {
            this.pendingChanges.splice(index, 1);
            this.update();
        }
    }

    async apply() {
        const contentToSave = this.pendingChanges.map(c => {
            const changedArray = c.changedFields.map(f => {
                const { originalValue, ...changedObj } = f;
                return changedObj;
            });
            return {
                keyValues: c.contentId,
                contentTypeId: c.contentTypeId,
                changedFields: changedArray
            }
        })
        if (await contentSaver.save(contentToSave) == false) {
            return false; // fail
        }
        this.pendingChanges = [];
        this.update();
    }

    mergeWithPendingChanges(contentId, contentTypeId, content) {
        if (!contentId && contentId !== null) {
            throw new Error('ContentId must be null or a valid value (string, number, ...)')
        }

        const changesForContent = this.pendingChanges.find(c => (contentId === null || c.contentId.every(function (id, i) { return id === contentId[i] })) && c.contentTypeId === contentTypeId);

        const contentOriginal = {};
        Object.keys(content).forEach(k => {
            contentOriginal[`${k}_original`] = content[k] || null;
        })

        const contentMapping = { ...contentOriginal, ...content };
        if (!changesForContent) {
            return contentMapping;
        }

        changesForContent.changedFields.forEach(changedField => {
            contentMapping[changedField.name] = changedField.value;
        });

        return contentMapping;
    }
}

export default ChangeTracker;