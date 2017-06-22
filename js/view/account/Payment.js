/**
 * account/Payment.js
 */

define([
  'app',
  'collection/account/FundingSourcesCollection',
  'view/FundingSourcesView',
  'view/DwollaView',
  'view/modals/ModalFundingSourceView'
  // 'text!templates/account/account-payment.html',
],
function(
  app,
  FundingSourcesCollection,
  FundingSourcesView,
  DwollaView,
  ModalFundingSourceView
) {

  return Backbone.View.extend({

    className: 'account account-payment',

    events: {
      'click .action-add': 'addFundingSource',
    },

    initialize: function(options) {
      if (options) _.extend(this, options);

      var self = this;

      if (this.FundingSourcesView) this.FundingSourcesView.close();

      this.model = this.parentModel;

      this.model.fetch().then(function() {
        self.render();
      });
    },

    attachEvents: function() {
      this.on('modelAdded', this.initialize, this);
      this.listening = true;
    },

    render: function() {

      if (!this.listening) this.attachEvents();

      this.FundingSourcesView = new FundingSourcesView({
        parentView: this
      });

      this.$el.html(this.FundingSourcesView.$el);

      this.delegateEvents();

      return this;
    },

    addFundingSource: function() {
      this.modal = new ModalFundingSourceView({
        action: 'add',
        eventName: 'modelAdded',
        context: this
      });
    }

  });
});
