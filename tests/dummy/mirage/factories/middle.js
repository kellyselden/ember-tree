import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  name(i) { return `middle ${i}`; }
});
