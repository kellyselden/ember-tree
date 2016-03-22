import { Model, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  tops: hasMany('top'),
  middles: hasMany('middle'),
  bottoms: hasMany('bottom')
});
