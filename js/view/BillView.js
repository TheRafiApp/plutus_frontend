/**
 * BillView.js
 */

define([
  'app',
  'view/cards/user',
  'view/cards/transfer',
  'view/modals/ModalTransferView',
  'model/bills/BillModel',
  'text!templates/bills/bill.html',
  'text!templates/headers/header-tertiary-model.html',
],
function(
  app, 
  UserCard, 
  TransferCard, 
  ModalTransferView, 
  BillModel, 
  BillTemplate, 
  HeaderTemplate
) {

  return Backbone.View.extend({

    className: 'bill-view scroll-y',

    events: {
      'click .action-add-transfer': 'addTransfer',
      'click .action-delete': 'promptDelete',
      'click .action-close': 'hideTertiary'
    },

    template: _.template(BillTemplate),
    template_container: _.template(HeaderTemplate),

    initialize: function(options) {
      _.extend(this, options);
      var self = this;

      this.model = new BillModel({ _id: this._id });

      Backbone.Validation.bind(this);

      this.model.fetch().then(function() {
        self.render();
      });
    },

    attachEvents: function() {
      this.on('transferAdded', this.initialize, this);
      this.on('confirmDelete', this.deleteModel, this);
      this.listening = true;
    },

    render: function() {
      var self = this;

      if (!this.listening) this.attachEvents();

      var data = this.model.toJSON();

      var header_info = {
        model: this.model.get('type') + ' Bill – ' + this.model.get('address') + ' – ' + this.model.display_name()
      };

      this.$el.html(this.template_container({
        header: header_info,
        options: {
          delete: !!(this.model.get('type') == 'anytime')
        }
      }));

      this.$el.find('.scroll-y').html(this.template({ 
        bill: data,
        prettyMoney: app.utils.prettyMoney,
        role: app.session.get('user_role')
      }));

      this.renderTenants();
      this.renderTransfers();

      $('.row[data-id="' + app.views.currentView.selected + '"]').addClass('selected');
      $('.tertiary').removeClass('loading');
      
      return this;
    },

    renderTenants: function() {
      var tenants = this.model.get('tenants');

      var self = this;

      var autopay_data = this.model.get('lease.autopay') || {};
      var split_data = this.model.get('lease.split') || {};

      tenants.forEach(function(tenant) {

        var split = split_data[tenant._id];
        var autopay = autopay_data[tenant._id];

        var user_card = new UserCard({
          data: tenant,
          rows: [
            '<span style="color:#394a67">Split: <strong>' + (split ? app.utils.prettyMoney(split) : 'Not Set') + '</strong></span>',
            '<span style="color:#394a67">Autopay: <strong>' + (autopay ? 'Enabled' : 'Disabled') + '</strong></span>'
          ]
        });

        self.$el.find('.tenants-cards').append(user_card.$el);

      });
    },

    renderTransfers: function() {
      var self = this;

      var transfers = this.model.get('transfers');

      transfers = transfers.sort(function(a, b) {
        return moment(a.created) < moment(b.created);
      });

      if (!transfers.length) return;

      this.$el.find('.transfer-cards').html('');
      
      _.each(transfers, function(transfer) {

        var transfer_card = new TransferCard({
          data: transfer
        });
        self.$el.find('.transfer-cards').append(transfer_card.$el);
      });
    },

    promptDelete: function() {
      var target = this.model.display_name();
      var message = 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    },

    deleteModel: function() {
      this.model.destroy().then(function() {
        var route = app.router.getRoute();
        app.router.navigate(route, { trigger: true });
      }).fail(function(error) {
        app.utils.handleError(error);
      });
    },

    hideTertiary: function() {
      if (app.views.modelView) app.controls.hideTertiary();
    },

    addTransfer: function() {
      this.modal = new ModalTransferView({
        action: 'add',
        type: 'offline',
        eventName: 'transferAdded',
        sources: this.model.get('tenants'),
        context: this
      });
    }

  });
});