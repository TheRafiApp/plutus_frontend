/**
 * MyBillsCollection.js
 */

define([
  'app',
  'model/bills/MyBillModel',
],
function(app, BillModel) {

  return app.Collection.extend({

    model: BillModel,

    initialize: function(options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options);

      this.suffix = this.options.active ? '/active' : '';
    },

    url: function() {
      return app.API() + 'account/bills' + this.suffix;
    }
    
  });

});