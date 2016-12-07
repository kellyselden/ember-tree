import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import defaultScenario from '../../mirage/scenarios/default';

moduleForAcceptance('Acceptance | application');

test('visiting /ember-data', function(assert) {
  defaultScenario(server);

  visit('/ember-data');

  andThen(function() {
    assert.equal(find('.tree-node').length, 5);
  });
});
