import Ember from 'ember';
import { moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { promiseArray } from 'ember-awesome-macros';

const {
  set, setProperties,
  RSVP: { defer },
  A: newArray,
  computed
} = Ember;

const globals = {};

let deferred;

function init() {
  moduleForComponent('tree-node', 'Integration | Component | tree node', {
    integration: true,
    beforeEach() {
      deferred = defer();
      setProperties(globals, {
        wasChildrenCalled: false,
        wasToggleChangedCalled: false,
        wasSelectionChangedCalled: false
      });

      this.set('model', Ember.Object.extend({
        text: 'test-text',
        children: promiseArray(computed(function() {
          globals.wasToggleChangedCalled = true;
          return deferred.promise;
        }))
      }).create());
      this.set('loadingText', 'test-loading');

      this.on('toggleChanged', (isOpen, model) => {
        globals.wasChildrenCalled = true;
        set(model, 'isOpen', isOpen);
      });
      this.on('opened', () => {});
      this.on('closed', () => {});
      this.on('selectionChanged', (isSelected, model) => {
        globals.wasSelectionChangedCalled = true;
        set(model, 'isSelected', isSelected);
      });
      this.on('selected', () => {});
      this.on('unselected', () => {});
    }
  });
}

export default init;

export { init, globals };

export function renderDefault(shouldResolve = true) {
  this.render(hbs`
    {{#tree-node
      model
      text=model.text
      loadingText=loadingText
      toggleChanged="toggleChanged"
      opened="opened"
      closed="closed"
      selectionChanged="selectionChanged"
      selected="selected"
      unselected="unselected"
      as |child|
    }}
      {{child}}
    {{/tree-node}}
  `);

  if (shouldResolve) {
    deferred.resolve(newArray(['test-child']));
  }
}
