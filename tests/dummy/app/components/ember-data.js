import Ember from 'ember';
import conditional from 'ember-cpm/macros/conditional';
import promiseArray from 'ember-awesome-macros/promise-array';

const {
  Component,
  get,
  computed,
  computed: { readOnly },
  RSVP: { all },
  inject: { service },
  A: newArray
} = Ember;

function getMyEntities(user, parent, childProperty) {
  let children = get(parent, childProperty);
  let userChildren = get(user, childProperty);

  return all([children, userChildren]).then(([children, userChildren]) => {
    let parentName = parent.constructor.modelName;
    let parentId = get(parent, 'id');

    let myChildren = userChildren.filterBy(`${parentName}.id`, parentId);

    return myChildren;
  });
}

function getMyTops(user, tops) {
  return getMyEntities(user, { tops }, 'tops');
}

function getMyMiddles(user, top) {
  return getMyEntities(user, top, 'middles');
}

function getMyBottoms(user, middle) {
  return getMyEntities(user, middle, 'bottoms');
}

function getComputedIsOpen(toggleProperty, id) {
  return computed(`${toggleProperty}.[]`, 'isSelected', function() {
    let isSelected = get(this, 'isSelected');
    if (!isSelected) {
      return false;
    }

    let toggles = get(this, toggleProperty);
    let isOpen = toggles.contains(id);

    return isOpen;
  });
}

function getComputedIsSelected(myChildrenProperty, childId) {
  return computed(`${myChildrenProperty}.[]`, function() {
    let myChildren = get(this, myChildrenProperty);
    let myChildIds = myChildren.mapBy('id');
    let isSelected = myChildIds.indexOf(childId) !== -1;

    return isSelected;
  });
}

function getComputedToggles() {
  return computed('user', function() {
    return newArray();
  });
}

export default Component.extend({
  store: service(),

  user: computed(function() {
    // reload true because if this is the first time tops are being loaded
    // it early returns with an empty list
    return get(this, 'store').findRecord('user', 1);
  }),

  tops: computed(function() {
    // reload true because if this is the first time tops are being loaded
    // it early returns with an empty list
    return get(this, 'store').findAll('top', { reload: true });
  }),

  topModels: promiseArray('user.tops.[]', function() {
    let component = this;

    return get(this, 'user').then(user => {
      let tops = get(this, 'tops');
      let myTops = getMyTops(user, tops);

      return all([tops, myTops]).then(([tops, myTops]) => {
        return tops.map(top => {
          let topId = get(top, 'id');

          return Ember.Object.extend({
            component,
            model: top,
            user,
            children: promiseArray('user.middles.[]', function() {
              let middles = get(top, 'middles');
              let myMiddles = getMyMiddles(user, top);

              return all([middles, myMiddles]).then(([middles, myMiddles]) => {
                return middles.map(middle => {
                  let middleId = get(middle, 'id');

                  return Ember.Object.extend({
                    component,
                    model: middle,
                    user,
                    children: promiseArray('user.bottoms.[]', function() {
                      let bottoms = get(middle, 'bottoms');
                      let myBottoms = getMyBottoms(user, middle);

                      return all([bottoms, myBottoms]).then(([bottoms, myBottoms]) => {
                        return bottoms.map(bottom => {
                          let bottomId = get(bottom, 'id');

                          return Ember.Object.extend({
                            component,
                            model: bottom,
                            user,
                            myBottoms,
                            isSelected: getComputedIsSelected('myBottoms', bottomId),
                            isDisabled: readOnly('component.isDisabled'),
                            shouldShowToggle: false
                          }).create();
                        });
                      });
                    }),
                    isOpen: getComputedIsOpen('component.middleToggles', middleId),
                    myMiddles,
                    isSelected: getComputedIsSelected('myMiddles', middleId),
                    isDisabled: readOnly('component.isDisabled'),
                    shouldShowToggle: readOnly('isSelected')
                  }).create();
                });
              });
            }),
            type: conditional('component.shouldShowRadios', 'radio', 'checkbox'),
            isOpen: getComputedIsOpen('component.topToggles', topId),
            myTops,
            isSelected: getComputedIsSelected('myTops', topId),
            isDisabled: readOnly('component.isDisabled'),
            shouldShowToggle: readOnly('isSelected')
          }).create();
        });
      });
    });
  }),

  topToggles: getComputedToggles(),
  middleToggles: getComputedToggles(),

  _toggleOpen(isOpen, entity, toggleProperty) {
    let toggles = get(this, toggleProperty);
    let id = get(entity, 'id');

    if (isOpen) {
      toggles.addObject(id);
    } else {
      toggles.removeObject(id);
    }
  },

  _removeAll(parent, childProperty, childFunc) {
    let user = get(this, 'user');
    let myEntities = getMyEntities(user, parent, childProperty);

    myEntities.then(myEntities => {
      myEntities.toArray().forEach(entity => {
        childFunc.call(this, false, entity);
      });
    });
  },

  _toggleRelationship(isSelected, entity, entitiesProperty, toggleProperty, childProperty, childFunc) {
    let entities = get(this, `user.${entitiesProperty}`);

    if (childProperty && !isSelected) {
      this._removeAll(entity, childProperty, childFunc);
    }

    return entities.then(entities => {
      if (isSelected) {
        entities.addObject(entity);
      } else {
        entities.removeObject(entity);

        this._toggleOpen(false, entity, toggleProperty);
      }
    });
  },

  _topSelectionChanged(isSelected, model) {
    let toggleRelationship = (isSelected, model) => {
      return this._toggleRelationship(isSelected, model, 'tops', 'topToggles', 'middles', this._middleSelectionChanged);
    };

    // radio group functionality
    if (get(this, 'shouldShowRadios')) {
      get(this, 'tops').then(tops => {
        return tops.map(top => {
          return toggleRelationship(false, top);
        });
      }).then(() => {
        toggleRelationship(isSelected, model);
      });
    } else {
      toggleRelationship(isSelected, model);
    }
  },
  _middleSelectionChanged(isSelected, model) {
    this._toggleRelationship(isSelected, model, 'middles', 'middleToggles', 'bottoms', this._bottomSelectionChanged);
  },
  _bottomSelectionChanged(isSelected, model) {
    this._toggleRelationship(isSelected, model, 'bottoms');
  },

  actions: {
    topToggleChanged(isOpen, topModel) {
      let model = get(topModel, 'model');
      this._toggleOpen(isOpen, model, 'topToggles');
    },
    middleToggleChanged(isOpen, middleModel) {
      let model = get(middleModel, 'model');
      this._toggleOpen(isOpen, model, 'middleToggles');
    },

    topSelectionChanged(isSelected, topModel) {
      let model = get(topModel, 'model');
      this._topSelectionChanged(isSelected, model);
    },
    middleSelectionChanged(isSelected, middleModel) {
      let model = get(middleModel, 'model');
      this._middleSelectionChanged(isSelected, model);
    },
    bottomSelectionChanged(isSelected, bottomModel) {
      let model = get(bottomModel, 'model');
      this._bottomSelectionChanged(isSelected, model);
    }
  }
});
