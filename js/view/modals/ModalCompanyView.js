/**
 * ModalCompanyView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'model/companies/CompanyModel',
  'text!templates/modals/modal-company.html'
],
function(
  app, 
  ModalView, 
  CompanyModel,
  ModalCompanyTemplate
) {

  return ModalView.extend({
    
    eventName: 'confirm',

    template: _.template(ModalCompanyTemplate),

    title: function() {
      return this.action + ' Company';
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      if (!this.model) this.model = new CompanyModel(null, {
        action: 'invite'
      });

      this.renderModalView();
    },

    render: function() {
      this.ready();

      return this;
    },

    handleError: function(e) {
      var error = e.responseJSON;
      var message;
      if (error.message.contains('duplicate', 'key')) {
        message = 'There is already a user with that ';

        if (error.data.key === 'phone') {
          message += 'phone number.';
        } else if (error.data.key === 'email') {
          message += 'email address.';
        }
      } else {
        message = 'Sorry, unable to create company at this time.';
      }
      app.alerts.error(message);
    }

  });
});