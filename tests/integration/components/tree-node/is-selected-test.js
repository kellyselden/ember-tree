import Ember from 'ember';
import { test } from 'ember-qunit';
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
  assert.expect(1);

  set(this, 'model.isSelected', true);

  renderDefault.call(this);

  assert.ok(this.$('input').prop('checked'));
});
