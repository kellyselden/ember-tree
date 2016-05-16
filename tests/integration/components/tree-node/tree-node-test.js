import Ember from 'ember';
import { test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { init, globals, renderDefault } from '../../../helpers/tree-node';

const {
  set
} = Ember;

init();

test('shows text', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  assert.strictEqual(this.$('.text').text().trim(), 'test-text');
});

test('shows default loading text', function(assert) {
  assert.expect(1);

  set(this, 'loadingText', undefined);

  renderDefault.call(this, false);

  this.$('.toggle').click();

  assert.strictEqual(this.$('.loading').text().trim(), 'loading...');
});

test('shows custom loading text', function(assert) {
  assert.expect(1);

  renderDefault.call(this, false);

  this.$('.toggle').click();

  assert.strictEqual(this.$('.loading').text().trim(), 'test-loading');
});

test('does\'t send action when started open', function(assert) {
  assert.expect(1);

  let done = assert.async();

  set(this, 'model.isOpen', true);

  let calledCount = 0;

  this.on('toggleChanged', isOpen => {
    calledCount++;

    if (!isOpen) {
      assert.strictEqual(calledCount, 1);

      done();
    }
  });

  renderDefault.call(this);

  this.$('.toggle').click();
});

test('has no content by default', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  assert.strictEqual(this.$('.children').text().trim(), '');
});

test('has content rendered when clicked once', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  this.$('.toggle').click();

  assert.strictEqual(this.$('.children').text().trim(), 'test-child');
});

test('has no content when clicked twice', function(assert) {
  assert.expect(1);

  renderDefault.call(this);

  this.$('.toggle').click();
  this.$('.toggle').click();

  assert.strictEqual(this.$('.children').text().trim(), '');
});

test('sends model on toggle changed', function(assert) {
  assert.expect(1);

  let done = assert.async();

  this.on('toggleChanged', (isOpen, model) => {
    assert.strictEqual(model.text, 'test-text');

    done();
  });

  renderDefault.call(this);

  this.$('.toggle').click();
});

test('sends model on open', function(assert) {
  assert.expect(1);

  let done = assert.async();

  this.on('opened', model => {
    assert.strictEqual(model.text, 'test-text');

    done();
  });

  renderDefault.call(this);

  this.$('.toggle').click();
});

test('sends model on close', function(assert) {
  assert.expect(1);

  let done = assert.async();

  this.on('closed', model => {
    assert.strictEqual(model.text, 'test-text');

    done();
  });

  renderDefault.call(this);

  this.$('.toggle').click();
  this.$('.toggle').click();
});

test('sends model on selection changed', function(assert) {
  assert.expect(1);

  let done = assert.async();

  this.on('selectionChanged', (isSelected, model) => {
    assert.strictEqual(model.text, 'test-text');

    done();
  });

  renderDefault.call(this);

  this.$('input').click();
});

test('sends model on selected', function(assert) {
  assert.expect(1);

  let done = assert.async();

  this.on('selected', model => {
    assert.strictEqual(model.text, 'test-text');

    done();
  });

  renderDefault.call(this);

  this.$('input').click();
});

test('sends model on unselected', function(assert) {
  assert.expect(1);

  let done = assert.async();

  this.on('unselected', model => {
    assert.strictEqual(model.text, 'test-text');

    done();
  });

  renderDefault.call(this);

  this.$('input').click();
  this.$('input').click();
});

test('doesn\'t load children before toggle', function(assert) {
  assert.expect(1);

  renderDefault.call(this, false);

  assert.notOk(globals.wasChildrenCalled);
});

test('preserves toggle open in children when parent closes', function(assert) {
  assert.expect(1);

  this.render(hbs`
    {{#tree-node
      (hash
        children=(array null)
      )
      id="parent"
      handleToggleInternally=true
    }}
      {{tree-node
        model
        id="child"
        handleToggleInternally=true
      }}
    {{/tree-node}}
  `);

  this.$('#parent .toggle:first').click();

  this.$('#child .toggle').click();

  this.$('#parent .toggle:first').click();
  this.$('#parent .toggle:first').click();

  assert.strictEqual(this.$('#child .open').length, 1);
});
