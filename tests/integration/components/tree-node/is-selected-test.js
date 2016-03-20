import { test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import init from './tree-node';

init();

test('can start selected', function(assert) {
  // assert.expect(2);

  this.render(hbs`
    {{#tree-node
      (hash
        children=(array
          (hash
            isSelected=true
          )
        )
        isOpen=true
        isSelected=true
      )
      id="parent"
      selectionChanged="selectionChanged"
      as |child|
    }}
      {{tree-node
        child
        id="child"
      }}
    {{/tree-node}}
  `);

  assert.ok(this.$('#parent input:first').prop('checked'));
  assert.ok(this.$('#child input').prop('checked'));

  this.$('#parent input:first').click();

  assert.notOk(this.$('#parent input:first').prop('checked'));
});
