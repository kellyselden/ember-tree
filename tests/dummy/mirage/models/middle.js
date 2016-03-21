import { Model, belongsTo, hasMany } from 'ember-cli-mirage';

export default Model.extend({
  users: hasMany('user'),
  top: belongsTo('top'),
  bottoms: hasMany('bottom')
});
