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
        microDeposits: false,
        fallbackToMicroDeposits: true
      }, function(error, response) {

        // IAV successful
        if (response) {
          
          var data = {
            id: response._links['funding-source'].href.split('funding-sources/')[1], // id
            status: response._links['verify-micro-deposits'] ? 'unverified' : 'verified'
          };

          app.utils.request({
            path: 'account/funding_sources',
            method: 'POST',
            data: data
          }).then(function() {
            self.closeModal();
            self.context.trigger(self.eventName);
          });

        //  IAV failed
        } else if (error) {
          app.controls.handleError(error);
        }
      });

    }
  });
});