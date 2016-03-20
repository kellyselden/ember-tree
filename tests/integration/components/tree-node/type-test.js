import Ember from 'ember';
import { test } from 'ember-qunit';
import { init, renderDefault } from './tree-node';

const {
  set
} = Ember;

init();

test('default type is checkbox', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  assert.strictEqual(this.$('input').attr('type'), 'checkbox');
});

test('type supports radio button', function(assert) {
  assert.expect(1);

  set(this, 'model.type', 'radio');

  renderDefault.call(this);

  assert.strictEqual(this.$('input').attr('type'), 'radio');
});
