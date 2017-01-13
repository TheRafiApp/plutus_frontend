/**
 * LedgerEntryView.js
 */

define([
  'app',
  'view/ModelView',
  'view/cards/user',
  'model/transfers/TransferModel',
  'text!templates/transfers/transfer.html'
],
function(app, ModelView, UserCardView, TransferModel, TransferTemplate) {

  return Backbone.View.extend({

    className: 'user-view',

    events: {
      'click .action-reinvite': 'resendInvitation',
      'click .action-cancel-transfer': 'cancelTransfer'
    },

    template: _.template(TransferTemplate),

    initialize: function(options) {
      _.extend(this, options);
      var self = this;
      var role = app.router.getRoute();

      this.model = new TransferModel({ _id: this._id });
      this.model.fetch().then(function() {
        self.render();
      });
    },

    render: function() {

      this.ModelView = new ModelView({
        context: this,

        options: {
          edit: true,
          delete: true
        }
      });

      this.$el.html(this.ModelView.$el);

      var source = this.model.get('source');

      if (source) {
        this.$el.find('.source').html(new UserCardView({
          data: source
        }).$el);
      }

      var destination = this.model.get('destination');

      this.$el.find('.destination').html(new UserCardView({
        data: destination
      }).$el);

      $('.tertiary').removeClass('loading');

      return this;
    },

    cancelTransfer: function() {
      var self = this;

      this.model.cancelTransfer().then(function() {
        app.router.navigate('ledger', { trigger: true });
      });
    }
    
  });
});