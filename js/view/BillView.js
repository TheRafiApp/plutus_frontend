/**
 * BillView.js
 */

define([
  'app',
  'view/cards/user_payments',
  'view/modals/ModalTransferView',
  'model/bills/BillModel',
  'text!templates/bills/bill.html',
  'text!templates/headers/header-tertiary-model.html',
],
function(app, UserCardView, ModalTransferView, BillModel, BillTemplate, HeaderTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'bill-view scroll-y',

    events: {
      'click .action-add-transfer': 'addTransfer',
      // 'click .action-edit': 'toggleEdit',
      // 'click .action-cancel': 'cancelEdit',
      // 'click .action-save': 'promptSave',
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
        model: this.model.get('type') + ' Bill – ' + this.model.display_name()
      };

      this.$el.html(this.template_container({
        header: header_info,
        options: {
          delete: !!(this.model.get('type') == 'anytime')
        }
      }));

      this.$el.find('.scroll-y').html(this.template({ 
        bill: data,
        prettyMoney: app.utils.prettyMoney
      }));

      this.tenants = this.model.get('tenants');
      var transfers = this.model.get('transfers');

      _.each(this.tenants, function(tenant) {
        var tenant_id = tenant._id; 
        var amount = 0;

        transfers.forEach(function(transfer) {
          if (transfer.source == tenant_id && !['failed', 'error', 'cancelled'].contains(transfer.status.state)) { 
            amount += transfer.amount;
          }
        });

        // console.log(tenant_transfers)

        var tenant_card = new UserCardView({
          data: tenant,
          amount: amount
        });

        self.$el.find('.transfer-cards').append(tenant_card.$el);
      });

      $('.row[data-id="' + app.views.currentView.selected + '"]').addClass('selected');

      $('.tertiary').removeClass('loading');
      
      return this;
    },

    promptDelete: function() {
      var target = this.model.display_name();
      var message = 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    },

    deleteModel: function() {
      this.model.destroy().then(function() {
        console.log('success')

        
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
        context: this,
      });
    }

  }));
});