import Ember from 'ember';
import conditional from 'ember-cpm/macros/conditional';
import promiseArray from 'ember-awesome-macros/promise-array';

const {
  Component,
  get,
  computed,
  computed: { readOnly },
  observer,
  RSVP: { Promise, all },
  inject: { service },
  A: newArray
} = Ember;

function getMyEntities(user, parent, childrenProperty) {
  let children = get(parent, childrenProperty);
  let userChildren = get(user, childrenProperty);

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

function getComputedType() {
  return conditional('component.shouldShowRadios', 'radio', 'checkbox');
}

function getComputedIsOpen(togglesProperty, id) {
  return computed(`${togglesProperty}.[]`, 'isSelected', function() {
    let isSelected = get(this, 'isSelected');
    if (!isSelected) {
      return false;
    }

    let toggles = get(this, togglesProperty);
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

function getComputedIsDisabled() {
  return readOnly('component.isDisabled');
}

export default Component.extend({
  store: service(),

  user: computed(function() {
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
            children: promiseArray('component.user.middles.[]', function() {
              let middles = get(top, 'middles');
              let myMiddles = getMyMiddles(user, top);

              return all([middles, myMiddles]).then(([middles, myMiddles]) => {
                return middles.map(middle => {
                  let middleId = get(middle, 'id');

                  return Ember.Object.extend({
                    component,
                    model: middle,
                    children: promiseArray('component.user.bottoms.[]', function() {
                      let bottoms = get(middle, 'bottoms');
                      let myBottoms = getMyBottoms(user, middle);

                      return all([bottoms, myBottoms]).then(([bottoms, myBottoms]) => {
                        return bottoms.map(bottom => {
                          let bottomId = get(bottom, 'id');

                          return Ember.Object.extend({
                            component,
                            model: bottom,
                            type: getComputedType(),
                            myBottoms,
                            isSelected: getComputedIsSelected('myBottoms', bottomId),
                            isDisabled: getComputedIsDisabled(),
                            shouldShowToggle: false
                          }).create();
                        });
                      });
                    }),
                    type: getComputedType(),
                    isOpen: getComputedIsOpen('component.middleToggles', middleId),
                    myMiddles,
                    isSelected: getComputedIsSelected('myMiddles', middleId),
                    isDisabled: getComputedIsDisabled(),
                    shouldShowToggle: readOnly('isSelected')
                  }).create();
                });
              });
            }),
            type: getComputedType(),
            isOpen: getComputedIsOpen('component.topToggles', topId),
            myTops,
            isSelected: getComputedIsSelected('myTops', topId),
            isDisabled: getComputedIsDisabled(),
            shouldShowToggle: readOnly('isSelected')
          }).create();
        });
      });
    });
  }),

  _removeAllButFirst(modelsProperty, entitiesProperty, togglesProperty, childrenProperty, childenFunc) {
    return get(this, modelsProperty).then(models => {
      let selectedModels = models.filterBy('isSelected');

      let modelsToDeselect = selectedModels.slice(1);
      modelsToDeselect = newArray(modelsToDeselect);
      modelsToDeselect = modelsToDeselect.mapBy('model');

      let promises = modelsToDeselect.map(model => {
        return this._toggleRelationship(false, model, entitiesProperty, togglesProperty, childrenProperty, childenFunc);
      });

      return all(promises);
    });
  },

  couldntFigureOutHowToDoThisWithoutAnObserver: observer('shouldShowRadios', function() {
    let shouldShowRadios = get(this, 'shouldShowRadios');

    if (shouldShowRadios) {
      return all(
        this._removeAllButFirst('topModels', 'tops', 'topToggles', 'middles', this._middleSelectionChanged),
        this._removeAllButFirst('middleModels', 'middles', 'middleToggles', 'bottoms', this._bottomSelectionChanged),
        this._removeAllButFirst('topModels', 'bottoms')
      );
    }
  }),

  topToggles: getComputedToggles(),
  middleToggles: getComputedToggles(),

  _toggleOpen(isOpen, entity, togglesProperty) {
    let toggles = get(this, togglesProperty);
    let id = get(entity, 'id');

    if (isOpen) {
      toggles.addObject(id);
    } else {
      toggles.removeObject(id);
    }
  },

  _removeAll(parent, childrenProperty, childenFunc) {
    let user = get(this, 'user');
    let myEntities = getMyEntities(user, parent, childrenProperty);

    myEntities.then(myEntities => {
      myEntities.toArray().forEach(entity => {
        childenFunc.call(this, false, entity);
      });
    });
  },

  _toggleRelationship(isSelected, entity, entitiesProperty, togglesProperty, childrenProperty, childenFunc) {
    let entities = get(this, `user.${entitiesProperty}`);

    if (childrenProperty && !isSelected) {
      this._removeAll(entity, childrenProperty, childenFunc);
    }

    return entities.then(entities => {
      if (isSelected) {
        entities.addObject(entity);
      } else {
        entities.removeObject(entity);

        this._toggleOpen(false, entity, togglesProperty);
      }
    });
  },

  _selectionChanged(isSelected, model, modelsProperty, entitiesProperty, togglesProperty, childrenProperty, childenFunc) {
    let toggleRelationship = (isSelected, model) => {
      return this._toggleRelationship(isSelected, model, entitiesProperty, togglesProperty, childrenProperty, childenFunc);
    };

    let promise;

    if (get(this, 'shouldShowRadios')) {
      promise = get(this, modelsProperty).then(models => {
        let selectedModels = models.filterBy('isSelected');

        selectedModels = newArray(selectedModels);
        selectedModels = selectedModels.mapBy('model');

        let promises = selectedModels.map(model => {
          return toggleRelationship(false, model);
        });

        return all(promises);
      });
    } else {
      promise = Promise.resolve();
    }

    promise.then(() => {
      toggleRelationship(isSelected, model);
    });
  },

  _topSelectionChanged(isSelected, model) {
    this._selectionChanged(isSelected, model, 'topModels', 'tops', 'topToggles', 'middles', this._middleSelectionChanged);
  },
  _middleSelectionChanged(isSelected, model) {
    this._selectionChanged(isSelected, model, 'middleModels', 'middles', 'middleToggles', 'bottoms', this._bottomSelectionChanged);
  },
  _bottomSelectionChanged(isSelected, model) {
    this._selectionChanged(isSelected, model, 'bottomModels', 'bottoms');
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
