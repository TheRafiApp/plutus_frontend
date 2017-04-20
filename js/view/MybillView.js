/**
 * MyBillView.js
 */

define([
  'app',
  'view/cards/user_payments',
  'view/modals/ModalTransferView',
  'model/bills/MyBillModel',
  'text!templates/bills/mybill.html',
  'text!templates/headers/header-tertiary-model.html',
],
function(app, UserCardView, ModalTransferView, BillModel, BillTemplate, HeaderTemplate) {

  return Backbone.View.extend({

    className: 'panel bill-view scroll-y',

    events: {
      'click .action-pay': 'showTransferModal',
      // 'click .action-save': 'promptSave',
    },

    template: _.template(BillTemplate),
    template_container: _.template(HeaderTemplate),

    initialize: function(options) {
      _.extend(this, options);
      var self = this;

      this.model = new BillModel({ _id: this._id });
      this.model.fetch().then(function() {
        self.render();
      });

      // Backbone.Validation.bind(this);
    },

    attachEvents: function() {
      this.on('transferAdded', this.initialize, this);
      this.listening = true;
    },

    render: function() {
      var self = this;
      
      if (!this.listening) this.attachEvents();

      var data = this.model.toJSON();

      var path = app.router.getPath().split('/');
      path.pop();

      this.$el.html(this.template({ 
        user: app.session.user.toJSON(),
        bill: data,
        back_path: path.join('/'),
        prettyMoney: app.utils.prettyMoney
      }));

      app.controls.maskMoney('.amount', this, 7);

      var my_id = app.session.user.id;

      // render tenant transfers list
      this.tenants = this.model.get('tenants');

      this.tenants = this.tenants.sort(function(a, b) {
        if (a._id === my_id) {
          return -1;
        } else if (b._id === my_id) {
          return 1;
        }
      });
      
      var totals = this.model.get('transfers_by_user');

      // console.log(totals)

      _.each(this.tenants, function(tenant) {
        var id = tenant._id; 

        var tenant_card = new UserCardView({
          data: tenant,
          amount: totals[id]
        });

        self.$el.find('.transfer-cards').append(tenant_card.$el);
      });

      $('.tertiary').removeClass('loading');

      return this;
    },

    hideTertiary: function() {
      $('.row.selected').removeClass('selected');
      $('body').addClass('tertiary-hidden');
    },

    showTransferModal: function() {
      var amount;

      if (this.model.get('type') === 'monthly') {
        var split = this.model.get('lease.split');
        var my_id = app.session.user.id;
        var mySplit;
        if (split) mySplit = split[my_id];
        amount = mySplit;
      } else {
        amount = this.model.get('total');
      }

      this.modal = new ModalTransferView({
        action: 'submit',
        model: this.model,
        eventName: 'transferAdded',
        context: this,
        amount: amount
      });
    }

  });
});