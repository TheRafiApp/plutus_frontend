/**
 * BillsCollection.js
 */

define([
  'app',
  'model/bills/BillModel',
],
function(app, BillModel) {

  return app.Collection.extend({

    model: BillModel,

    url: function() {
      return app.API() + 'bills/';
    },

    initialize: function(models, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options); 

      this.on('sync', this.defaultSort, this);

      if (!this.options.base) this.options.base = '';
    },

    defaultSort: function() {
      this.sortByField('due_date');
      this.models.reverse();
    }
    
    
  });

});