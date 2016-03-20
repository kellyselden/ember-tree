import Ember from 'ember';
import { test } from 'ember-qunit';
import wait from 'ember-test-helpers/wait';
import { init, renderDefault } from './tree-node';

const {
  set
} = Ember;

init();

test('default toggle shows', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  assert.strictEqual(this.$('.toggle').length, 1);
});

test('can start with toggle hidden', function(assert) {
  assert.expect(1);

  set(this, 'model.shouldShowToggle', false);

  renderDefault.call(this);

  assert.strictEqual(this.$('.toggle').length, 0);
});

test('can hide toggle', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  return wait().then(() => {
    set(this, 'model.shouldShowToggle', false);

    return wait();
  }).then(() => {
    assert.strictEqual(this.$('.toggle').length, 0);
  });
});

test('can show toggle', function(assert) {
  assert.expect(1);

  set(this, 'model.shouldShowToggle', false);

  renderDefault.call(this);

  return wait().then(() => {
    set(this, 'model.shouldShowToggle', true);

    return wait();
  }).then(() => {
    assert.strictEqual(this.$('.toggle').length, 1);
  });
});
