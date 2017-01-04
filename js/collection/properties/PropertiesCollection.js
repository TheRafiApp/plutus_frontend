/**
 * PropertiesCollection.js
 */

define([
  'app',
  'model/properties/PropertyModel'
],
function(app, PropertyModel) {

  return app.Collection.extend({

    model: PropertyModel,

    url: function() {
			return app.API() + 'properties/';
    }
    
  });

});