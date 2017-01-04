/**
 * UnitsCollection.js
 */

define([
  'app',
  'model/properties/UnitModel'
],
function(app, UnitModel) {

  return app.Collection.extend({

    model: UnitModel,

    url: function() {
			return app.API() + 'properties/' + this.options.parentModelId + '/units';
    },

  });

});