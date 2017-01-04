/**
 * EventsCollection.js
 */

define([
  'app',
  // 'model/companies/CompanyModel'
],
function(app) {

  return app.Collection.extend({

    // model: CompanyModel,

    url: function() {
			return app.API() + 'events/';
    }
    
  });

});