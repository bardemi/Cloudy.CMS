import Form from './form.js';
import Field from './field.js';
import Sortable from './sortable.js';
import SortableItem from './sortable-item.js';
import PopupMenu from '../PopupMenuSupport/popup-menu.js';
import Button from '../button.js';
import urlFetcher from '../url-fetcher.js';

class SortableBuilder {
    build(app, blade, target, fieldModel, eventDispatcher) {
        if (!target[fieldModel.descriptor.camelCaseId]) {
            target[fieldModel.descriptor.camelCaseId] = [];
        }

        var sortable;

        if (fieldModel.descriptor.embeddedFormId) {
            if (fieldModel.descriptor.control) {
                sortable = new fieldModel.controlType(fieldModel, target[fieldModel.descriptor.camelCaseId], app, blade);
            } else {
                sortable = this.buildSortableEmbeddedForm(fieldModel, target[fieldModel.descriptor.camelCaseId], app, blade);
            }
        } else {
            if (fieldModel.descriptor.isPolymorphic) {
                sortable = this.buildSortablePolymorphicField(fieldModel, target[fieldModel.descriptor.camelCaseId], app, blade);
            } else {
                sortable = this.buildSortableSimpleField(fieldModel, target[fieldModel.descriptor.camelCaseId], app, blade, eventDispatcher);
            }
        }

        return sortable;
    }

    buildSortableEmbeddedForm(fieldModel, target, app, blade) {
        var createItem =
            index => {
                if (!(index in target)) {
                    target[index] = {};
                }

                var container = document.createElement('cloudy-ui-sortable-item-form');

                var form = this.buildEmbeddedForm(fieldModel, target[index]);

                container.appendChild(form.element);

                return new SortableItem(container, { form, actionContainer: container });
            };

        var sortable = new Sortable().setHorizontal();
        sortable.element.classList.add('cloudy-ui-sortable-form');
        sortable.addFooter(new Button('Add')
            .onClick(() => {
                var item = this.createItem(-1);
                this.addItem(item);
                this.triggerAdd(item);
            }));

        return sortable;
    }

    buildSortableSimpleField(fieldModel, target, app, blade, eventDispatcher) {
        var createItem = value => {
            var fieldElement = document.createElement('cloudy-ui-sortable-item-field');
            var fieldControlElement = document.createElement('cloudy-ui-sortable-item-field-control');
            fieldElement.appendChild(fieldControlElement);

            var control = new fieldModel.controlType(fieldModel, value, app, blade);
            fieldControlElement.appendChild(control.element);

            var field = new Field(fieldModel, fieldElement, { control });
            return new SortableItem(fieldElement, { field });
        };

        var sortable = new Sortable();
        sortable.element.classList.add('cloudy-ui-sortable-field');
        sortable.addFooter(new Button('Add').onClick(() => {
            const item = createItem();
            sortable.addItem(item);
            sortable.triggerAdd(item);
        }));

        target.forEach((value, index) => {
            const item = createItem(value);
            sortable.addItem(item);
            item.data.field.data.control.onChange(value => eventDispatcher.triggerChange(fieldModel.descriptor.camelCaseId, { type: 'array.update', value, index }));
        });

        let index = target.length;

        sortable.onAdd(
            item => (index => {
                item.data.field.data.control.onChange(value =>
                    eventDispatcher.triggerChange(fieldModel.descriptor.camelCaseId, { type: 'array.update', value, index })
                );
                eventDispatcher.triggerChange(fieldModel.descriptor.camelCaseId, { type: 'array.add', value: null, index });
            })(index++)
        );
        sortable.onDelete(index => eventDispatcher.triggerChange(fieldModel.descriptor.camelCaseId, { type: 'array.delete', index }));

        return sortable;
    }

    buildSortablePolymorphicField(fieldModel, target, app, blade) {
        const createItem = value => {
            var fieldElement = document.createElement('cloudy-ui-sortable-item-field');
            var fieldControlElement = document.createElement('cloudy-ui-sortable-item-field-control');
            fieldElement.appendChild(fieldControlElement);

            var control = new fieldModel.controlType(fieldModel, value, app, blade).appendTo(fieldControlElement);
            var field = new Field(fieldModel, fieldElement, { control });

            return new SortableItem(fieldElement, { field });
        };

        const sortable = new Sortable(true).setHorizontal();
        sortable.element.classList.add('cloudy-ui-sortable-field');

        for (let index = 0; index < target.length; index++) {
            sortable.addItem(createItem(target[index]));
        }

        const button = new Button('Add').onClick(() => menu.toggle());
        const menu = new PopupMenu(button.element);

        (async () => {
            const types = await urlFetcher.fetch(`PolymorphicForm/GetOptions?${fieldModel.descriptor.polymorphicCandidates.map((t, i) => `types[${i}]=${t}`).join('&')}`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            }, `Could not get form types for ${fieldModel.descriptor.polymorphicCandidates.join(', ')}`);

            if (types.length) {
                types.forEach(item =>
                    menu.addItem(listItem => {
                        listItem.setText(item.name);
                        listItem.onClick(() => {
                            sortable.addItem(createItem(item));
                        });
                    })
                );
            } else {
                menu.addItem(item => item.setDisabled().setText('(no items)'));
            }
        })();

        return sortable;
    }
}

export default new SortableBuilder();