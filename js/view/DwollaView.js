/**
 * account/DwollaView.js
 */

define([
  'app',
  'view/modals/ModalDwollaTransferView',
  'text!templates/account/account-dwolla.html',
],
function(app, ModalDwollaTransferView, DwollaTemplate) {

  return Backbone.View.extend({

    className: 'dwolla',

    events: {
      'click .action-transfer': 'showTransferModal'
    },

    template: _.template(DwollaTemplate),

    initialize: function(options) {
      if (options) _.extend(this, options);
      this.render();
      return this;
    },

    render: function() {
      var self = this;

      // var dwolla_balance = this.parentView.collection.find(function(funding_source) {
      //   return funding_source.type === 'balance'
      // })

      this.$el.html(this.template());
      // $('body').removeClass('loading');

      return this;
    },

    showTransferModal: function() {
      this.modal = new ModalDwollaTransferView({
        action: 'add',
        type: 'offline',
        eventName: 'transferAdded',
        sources: this.parentView.collection,
        context: this
      });
    }

  });
});
