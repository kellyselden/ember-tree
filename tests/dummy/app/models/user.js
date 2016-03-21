import DS from 'ember-data';

const {
  Model,
  hasMany
} = DS;

export default Model.extend({
  tops: hasMany(),
  middles: hasMany(),
  bottoms: hasMany()
});
