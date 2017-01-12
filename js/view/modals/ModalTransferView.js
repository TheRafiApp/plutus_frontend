/**
 * ModalTransferView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'collection/account/FundingSourcesCollection',
  // 'collection/users/ManagersCollection',
  'model/transfers/TransferModel',
  'view/repeaters/date-calendar',
  'text!templates/modals/modal-transfer.html'
],
function(
  app,
  ModalView, 
  FundingSourcesCollection,
  // ManagersCollection, 
  TransferModel, 
  DateView, 
  ModalTransferTemplate
) {

  return ModalView.extend({

    'events': { 
      'blur .amount': 'validateAmount'
    },

    title: function() {
      var label = this.type === 'offline' ? this.type : '';
      return this.action + ' ' + label + ' Payment';
    },
    
    template: _.template(ModalTransferTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      // var promises = app.utils.promises(2);

      if (!this.model) this.model = new TransferModel(null, {
        action: 'add'
      });

      // this.managers = new ManagersCollection();
      // this.managers.fetch().then(function() {
      //   promises[0].resolve();
      // });

      this.funding_sources = new FundingSourcesCollection();
      // this.funding_sources.fetch().then(function() {
      //   promises[1].resolve();
      // });

      // $.when.apply($, promises).then(function() {
      //   self.renderModalView();
      // });
      this.funding_sources.fetch().then(function() {
        self.renderModalView();
      });
    },

    validateAmount: function(e) {
      var amount = $(e.currentTarget).val();
      var invalid = app.utils.validateMoney(amount);
      
      if (invalid) {
        app.controls.fieldError({
          element: $(e.currentTarget),
          type: 'error',
          error: invalid
        });
      }
    },

    render: function() {

      var funding_sources = this.funding_sources.toJSON();

      var primary_id = app.session.user.get('dwolla_account.primary_funding_source');
      var primary_fs = funding_sources.find(function(funding_source) {
        return funding_source.id === primary_id;
      });

      var options = {
        type: this.type,
        amount: this.amount,
        company: app.session.user.get('company'),
        primary_fs: primary_fs
      };

      if (this.type === 'electronic') {
        options.destination = this.managers.toJSON();
      } else if (this.type === 'offline') {
        options.source = this.context.tenants;
      }

      this.ready(options);

      if (this.type === 'offline') {
        // init datepicker
        this.$el.find('.date-picker').html(new DateView({
          name: 'date',
          context: this
        }).$el);
      }

      return this;
    },

    confirm: function() {
      var self = this;
      var formData = this.constructData();
      if (this.type === 'offline') formData.bill = this.context.model.get('_id');

      if (!app.utils.validate(this, formData)) return false;

      // var microdeposits = app.session.user.get('dwolla_account.microdeposits');
      // if (microdeposits && this.type !== 'offline') {
      //   app.alerts.error('Your bank account is unverified, please use microdeposits to verify before proceeding');
      //   return;
      // }

      this.$el.find('.modal').addClass('loading');

      this.model.save(formData).then(function() {
        // we dont actually want this data on the model...
        var amount = formData.amount;
        var balance = self.model.get('display_balance');
        self.model.set({
          'updated': moment.utc().toISOString(),
          'display_balance': balance - amount
        });
        self.model.unset('amount', { silent: true });
        self.$el.find('.modal').addClass('success');

        app.controls.wait(1900).then(function() {
          self.$el.find('.modal').removeClass('loading success');
          self.context.trigger(self.eventName);
          self.closeModal();
        });
        
      }).fail(function() {
        console.warn(arguments);
      });
    }

  });
});