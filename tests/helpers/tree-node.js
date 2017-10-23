import { defer } from 'rsvp';
import { A as emberA } from '@ember/array';
import EmberObject, {
  computed,
  setProperties,
  set
} from '@ember/object';
import { moduleForComponent } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { array as promiseArray } from 'ember-awesome-macros/promise';

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

      this.set('model', EmberObject.extend({
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
    deferred.resolve(emberA(['test-child']));
  }
}
