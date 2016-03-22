import DS from 'ember-data';

const {
  Model,
  attr,
  hasMany,
  belongsTo
} = DS;

export default Model.extend({
  name: attr(),

  users: hasMany(),
  middle: belongsTo()
});
