import { set } from '@ember/object';
import { test } from 'ember-qunit';
import { init, renderDefault } from '../../../helpers/tree-node';

init();

test('has closed class by default', function(assert) {
  assert.expect(2);

  renderDefault.call(this);

  assert.strictEqual(this.$('.closed').length, 1);
  assert.strictEqual(this.$('.open').length, 0);
});

test('can be started open', function(assert) {
  assert.expect(2);

  set(this, 'model.isOpen', true);

  renderDefault.call(this);

  assert.strictEqual(this.$('.closed').length, 0);
  assert.strictEqual(this.$('.open').length, 1);
});

test('has open class when clicked once', function(assert) {
  assert.expect(2);

  renderDefault.call(this);

  this.$('.toggle').click();

  assert.strictEqual(this.$('.closed').length, 0);
  assert.strictEqual(this.$('.open').length, 1);
});

test('has closed class when clicked twice', function(assert) {
  assert.expect(2);

  renderDefault.call(this);

  this.$('.toggle').click();
  this.$('.toggle').click();

  assert.strictEqual(this.$('.closed').length, 1);
  assert.strictEqual(this.$('.open').length, 0);
});

test('isOpen is true on first click', function(assert) {
  assert.expect(1);

  let done = assert.async();

  this.on('toggleChanged', isOpen => {
    assert.ok(isOpen);

    done();
  });

  renderDefault.call(this);

  this.$('.toggle').click();
});

test('isOpen is false on second click', function(assert) {
  assert.expect(1);

  let done = assert.async();

  this.on('toggleChanged', (isOpen, model) => {
    if (!isOpen) {
      assert.ok(true);

      done();
    } else {
      set(model, 'isOpen', isOpen);
    }
  });

  renderDefault.call(this);

  this.$('.toggle').click();
  this.$('.toggle').click();
});
