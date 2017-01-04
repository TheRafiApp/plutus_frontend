/**
 * account/Transfers.js
 */

define([
  'app',
  'view/transfers/TransferView',
  'collection/session/AccountTransfersCollection',
  'text!templates/transfers/transfers.html'
],
function(app, TransferView, AccountTransfersCollection, AccountTransfersTemplate) {

  return Backbone.View.extend({

    className: 'account account-transfers loading',

    template: _.template(AccountTransfersTemplate),

    initialize: function() {
      var self = this;

      this.$el.html(this.template());

      this.collection = new AccountTransfersCollection();

      this.collection.fetch().then(function() {
        self.render();
      });
    },

    render: function() {
      var self = this;

      if (this.collection.length > 0) {
        this.collection.each(function(model) {
          self.$el.find('.transfers').append(new TransferView({ model: model }).$el);
        });        
      } else {
        self.$el.find('.transfers').html('No transfers found.');
      }

      this.$el.removeClass('loading');
      return this;
    },

  });
});