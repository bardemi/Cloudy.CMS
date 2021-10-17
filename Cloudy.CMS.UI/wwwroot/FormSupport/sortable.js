﻿import Button from '../button.js';
import ContextMenu from '../ContextMenuSupport/context-menu.js';

class SortableField {
    callbacks = {
        add: [],
        move: [],
    };
    items = [];

    constructor() {
        this.fields = document.createElement('cloudy-ui-sortable-items');
        this.element = document.createElement('cloudy-ui-sortable');
        this.element.appendChild(this.fields);

        this.onMove((index, newIndex) => {
            if (newIndex < index) {
                this.fields.insertBefore(this.fields.children[index], this.fields.children[newIndex]);
            } else {
                if (this.fields.children[newIndex + 1]) {
                    this.fields.insertBefore(this.fields.children[index], this.fields.children[newIndex + 1]);
                } else {
                    this.fields.appendChild(this.fields.children[index]);
                }
            }
            this.items.splice(newIndex, 0, this.items.splice(index, 1)[0]);
        });
    }

    setHorizontal() {
        this.horizontal = true;
        return this;
    }

    addFooter(element) {
        this.element.appendChild(element);
    }

    addItem(item) {
        this.items.push(item);

        var field = document.createElement('cloudy-ui-sortable-item');
        this.fields.appendChild(field);

        var fieldAction = document.createElement('cloudy-ui-sortable-item-action');
        (item.data.actionContainer || field).appendChild(fieldAction);

        if (item.data.field && item.data.field.data.control.menu) {
            var menu = item.data.field.data.control.menu;

            if (menu.generators.length) {
                menu.addSeparator();
            }
        } else {
            var menu = new ContextMenu().appendTo(fieldAction);
        }

        menu.addItem(item => item.setText('Move up').onClick(() => {
            var index = [...this.fields.children].indexOf(field);

            if (index == 0) {
                return;
            }

            var newIndex = index - 1;

            this.triggerMove(index, newIndex);
        }));
        menu.addItem(item => item.setText('Move down').onClick(() => {
            var index = [...this.fields.children].indexOf(field);

            if (index == this.fields.children.length - 1) {
                return;
            }

            var newIndex = index + 1;

            this.triggerMove(index, newIndex);
        }));
        menu.addItem(item => item.setText('Delete').onClick(() => {
            var index = [...this.fields.children].indexOf(field);
            this.fields.children[index].remove();
            this.items.splice(index, 1);
        }));

        if (this.horizontal) {
            menu.setHorizontal();
            field.append(fieldAction);
        } else {
            menu.setCompact();
            item.element.append(fieldAction);
        }

        field.appendChild(item.element);
    }

    triggerAdd(value) {
        this.callbacks.add.forEach(callback => callback(value));
    }

    onAdd(callback) {
        this.callbacks.add.push(callback);

        return this;
    }

    triggerMove(index, newIndex) {
        this.callbacks.move.forEach(callback => callback(index, newIndex));
    }

    onMove(callback) {
        this.callbacks.move.push(callback);

        return this;
    }

    appendTo(element) {
        element.appendChild(this.element);

        return this;
    }
}

export default SortableField;