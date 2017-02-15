/**
 * TransfersCollection.js
 */

define([
  'app',
  'model/transfers/TransferModel',
],
function(app, TransferModel) {

  return app.Collection.extend({

    idAttribute: 'id',

    model: TransferModel,

    url: function() {
      return app.API() + this.options.base + 'transfers/';
    },

    initialize: function(models, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options); 

      this.on('sync', this.reverse, this);

      if (!this.options.base) this.options.base = '';
    },

    reverse: function() {
      this.models.reverse();
    }
    
  });

});