import Ember from 'ember';
import layout from '../templates/components/tree-node';
import {
  conditional,
  defaultTrue,
  or,
  raw
} from 'ember-awesome-macros';

const {
  Component,
  get, set,
  computed: { readOnly, alias }
} = Ember;

const MyComponent = Component.extend({
  layout,

  classNames: ['tree-node'],

  _loadingText: or('loadingText', raw('loading...')),

  toggleClass: conditional('isOpen', raw('open'), raw('closed')),

  children:            readOnly('model.children'),
  type:                      or('model.type', raw('checkbox')),
  isOpen:                 alias('model.isOpen'),
  isSelected:             alias('model.isSelected'),
  isDisabled:          readOnly('model.isDisabled'),
  shouldShowToggle: defaultTrue('model.shouldShowToggle'),

  isSelectedReadOnly: readOnly('isSelected'),

  handleToggleInternally: false,
  handleSelectionInternally: false,

  actions: {
    toggleChanged(model) {
      let isOpen = get(this, 'isOpen');

      isOpen = !isOpen;

      if (get(this, 'handleToggleInternally')) {
        set(this, 'isOpen', isOpen);
      } else {
        this.sendAction('toggleChanged', isOpen, model);
        this.sendAction(isOpen ? 'opened' : 'closed', model);
      }
    },
    selectionChanged(model) {
      let isSelected = get(this, 'isSelected');

      let type = get(this, 'type');
      if (type === 'radio' && isSelected) {
        return;
      }

      isSelected = !isSelected;

      if (get(this, 'handleSelectionInternally')) {
        set(this, 'isSelected', isSelected);
      } else {
        this.sendAction('selectionChanged', isSelected, model);
        this.sendAction(isSelected ? 'selected' : 'unselected', model);
      }
    }
  }
});

MyComponent.reopenClass({
  positionalParams: ['model']
});

export default MyComponent;
