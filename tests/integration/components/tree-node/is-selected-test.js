import Ember from 'ember';
import { test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { init, renderDefault } from './tree-node';

const {
  set
} = Ember;

init();

test('unchecked by default', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  assert.notOk(this.$('input').prop('checked'));
});

test('can select checkbox', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  this.$('input').click();

  assert.ok(this.$('input').prop('checked'));
});

test('can unselect checkbox', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  this.$('input').click();
  this.$('input').click();

  assert.notOk(this.$('input').prop('checked'));
});

test('isSelected is true on first click', function(assert) {
  assert.expect(1);

  let done = assert.async();

  this.on('selectionChanged', isSelected => {
    assert.ok(isSelected);

    done();
  });

  renderDefault.call(this);

  this.$('input').click();
});

test('isSelected is false on second click', function(assert) {
  assert.expect(1);

  let done = assert.async();

  this.on('selectionChanged', (isSelected, model) => {
    if (!isSelected) {
      assert.ok(true);

      done();
    } else {
      set(model, 'isSelected', isSelected);
    }
  });

  renderDefault.call(this);

  this.$('input').click();
  this.$('input').click();
});

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
