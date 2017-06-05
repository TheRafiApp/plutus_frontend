/**
 * ModalFundingSourceView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'text!templates/modals/modal-funding-source.html',
  'https://cdn.dwolla.com/1/dwolla.js',
],
function(
  app,
  ModalView,
  ModalFundingSourceTemplate
) {

  return ModalView.extend({

    title: 'Add Bank Account',

    actions: {
      confirm: false,
      cancel: true
    },

    template: _.template(ModalFundingSourceTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      app.utils.request({
        path: 'account/iav',
        method: 'GET'
      }).then(function(response) {
        self.iav_token = response;
        self.renderModalView();
      });
    },

    render: function() {
      var self = this;

      this.ready();
      this.renderIAV();

      return this;
    },

    renderIAV: function() {
      var self = this;

      this.$el.find('.modal').addClass('loading');

      app.controls.wait(1800).then(function() {
        self.$el.find('.modal').removeClass('loading');
      });

      var iav_token = this.iav_token;

      dwolla.configure(app.config.dwolla_env);
      dwolla.iav.start(iav_token, {
        container: 'iav-container',
        stylesheets: [
          'https://fonts.googleapis.com/css?family=Roboto',
          app.url.base_url + 'css/dwolla_style.css'
        ],
        microDeposits: true,
        fallbackToMicroDeposits: true
      }, function(error, response) {

        // IAV successful
        if (response) {
          console.log(response)
          self.processDwollaResponse(response);
        //  IAV failed
        } else if (error) {
          console.warn(error)
          app.alerts.error('Unable to link your account, please try again later');
          app.controls.reportError(error, false);
        }
      });
    },
    processDwollaResponse: function(response) {
      var self = this;
      var data = {
        id: response._links['funding-source'].href.split('funding-sources/')[1], // id
        status: response._links['verify-micro-deposits'] ? 'unverified' : 'verified'
      };

      var path = 'account/funding_sources';
      method = 'POST';

      app.utils.request({
        path: path,
        method: method,
        data: data
      }).then(function(data) {

        if (data.status === 'unverified') {
          // TODO: tell the user they will have to do microdeposits!!
        }

        self.closeModal();
        self.context.trigger(self.eventName);

      });
    }
  });
});
