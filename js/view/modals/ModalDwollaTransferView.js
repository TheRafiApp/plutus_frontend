/**
 * ModalTransferView.js
 */

define([
  'app',
  'view/modals/ModalView',
  // 'collection/account/FundingSourcesCollection',
  // 'collection/users/ManagersCollection',
  'model/transfers/TransferModel',
  // 'view/repeaters/date-calendar',
  'text!templates/modals/modal-dwolla-transfer.html'
],
function(
  app,
  ModalView,
  // FundingSourcesCollection,
  // ManagersCollection,
  TransferModel,
  // DateView,
  ModalTransferTemplate
) {

  return ModalView.extend({

    'events': {
      'blur .amount': 'validateAmount'
    },

    title: function() {
      return 'Transfer Funds';
    },

    template: _.template(ModalTransferTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      if (!this.model) this.model = new TransferModel(null, {
        action: 'manual'
      });

      this.renderModalView();
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
      var options = {
        type: this.type,
        amount: this.amount,
        // company: app.session.user.get('company'),
        // primary_fs: primary_fs,
        sources: this.sources.toJSON()
      };

      this.ready(options);

      var $destination = this.$el.find('select[name="destination_funding_source"] option:eq(2)')
      $destination.prop('selected', true)

      return this;
    },

    confirm: function() {
      var self = this;
      var formData = this.constructData();

      var errors = false;
      if (!app.utils.validate(this, formData)) errors = true;

      if (!this.validateSources(formData)) errors = true;

      if (errors) return

      var user_id = app.session.user.get('_id');
      var company_id = app.session.user.get('company._id')
      var dwolla_id = app.session.user.get('company.dwolla.customer_id')

      var defaults = {
        source: user_id,
        destination: company_id,
        company: company_id,
        source_customer_id: dwolla_id,
        destination_customer_id: dwolla_id,
        method: 'manual',
        type: 'electronic'
      }

      _.extend(formData, defaults);

      this.$el.find('.modal').addClass('loading');

      this.model.save(formData).then(function() {
        self.$el.find('.modal').addClass('success');

        app.controls.wait(1900).then(function() {
          self.$el.find('.modal').removeClass('loading success');
          self.context.trigger(self.eventName);
          self.closeModal();
        });

      }).fail(function() {
        console.warn(arguments);
      });
    },

    validateSources: function(formData) {
      if (formData.source_funding_source === formData.destination_funding_source) {
        app.controls.fieldError({
          element: 'select[name="destination_funding_source"]',
          error: 'Source and destination cannot be the same'
        });
      } else {
        return true
      }
    }

  });
});
