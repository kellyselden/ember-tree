import DS from 'ember-data';

const {
  Model,
  attr,
  belongsTo,
  hasMany
} = DS;

export default Model.extend({
  name: attr(),

  users: hasMany(),
  top: belongsTo(),
  bottoms: hasMany()
});
