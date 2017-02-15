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
    },

    initialize: function(models, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options); 

      this.on('sync', this.defaultSort, this);

      if (!this.options.base) this.options.base = '';
    },

    defaultSort: function() {
    	this.sortByField('created');
    	this.models.reverse();
    }
    
    
  });

});