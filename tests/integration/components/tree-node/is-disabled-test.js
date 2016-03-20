import Ember from 'ember';
import { test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import { init, globals, renderDefault } from './tree-node';

const {
  set
} = Ember;

init();

test('enabled by default', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  assert.notOk(this.$('input').prop('disabled'));
});

test('can disable', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  return wait().then(() => {
    set(this, 'model.isDisabled', true);

    return wait();
  }).then(() => {
    assert.ok(this.$('input').prop('disabled'));
  });
});

test('can start disabled', function(assert) {
  assert.expect(1);

  set(this, 'model.isDisabled', true);

  renderDefault.call(this);

  assert.ok(this.$('input').prop('disabled'));
});

test('doesn\'t send action when disabled', function(assert) {
  assert.expect(1);

  set(this, 'model.isDisabled', true);

  renderDefault.call(this);

  this.$('input').click();

  assert.notOk(globals.wasSelectionChangedCalled);
});

test('doesn\'t check box when disabled', function(assert) {
  assert.expect(1);

  set(this, 'model.isDisabled', true);

  renderDefault.call(this);

  this.$('input').click();

  assert.notOk(this.$('input').prop('checked'));
});
