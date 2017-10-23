import { set } from '@ember/object';
import { test } from 'ember-qunit';
import { init, renderDefault } from '../../../helpers/tree-node';

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
