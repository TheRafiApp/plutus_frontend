/**
 * account/onboarding/dwolla_iav.js
 */

define([
  'app',
  'text!templates/account/activate/dwolla_iav.html',
  'https://cdn.dwolla.com/1/dwolla.js',
],
function(app, OnboardingTemplate) {

  return Backbone.View.extend({

    className: 'dwolla',
    template: _.template(OnboardingTemplate),

    events: {
      'click .action-next': 'nextStep',
      // 'load iframe': 'loaded'
    },

    initialize: function(options) {
      if (options) _.extend(this, options);
      var self = this;

      this.user = this.parentView.user;

      var path;
      if (app.session.get('logged_in')) {
        path = 'account/iav';
      } else {
        path = this.user.get('role') + 's/activate/dwolla';
      }

      // get IAV token
      app.utils.request({
        path: path,
        method: 'GET'
      }).then(function(response) {

        var dwolla_data = self.user.get('dwolla') || {};
        dwolla_data.iav_token = response;
        self.parentView.user.set({
          dwolla: dwolla_data
        });

        self.render();
      }).fail(function(error) {
        app.controls.handleError(error);
      });
    },

    render: function() {
      var self = this;

      this.$el.html(this.template({
        logo: app.templates.logo()
      }));
      
      // check if the user has already done this step
      if (this.step.dwolla_account && this.step.dwolla_account.primary_funding_source) {
        // return this.renderAllSet();
      }

      // init dwolla.js
      var iav_token = this.user.get('dwolla.iav_token');

      dwolla.configure(app.config.dwolla_env);
      dwolla.iav.start(iav_token, {
        container: 'iav-container',
        stylesheets: [
          'https://fonts.googleapis.com/css?family=Roboto',
          app.url.base_url + '/css/dwolla_style.css'
        ],
        microDeposits: false,
        fallbackToMicroDeposits: true
      }, function(error, response) {

        // IAV successful
        if (response) {
          self.processDwollaResponse(response);

        //  IAV failed
        } else if (error) {
          app.controls.handleError(error);
        }
      });

      // hide loader once iframe is loaded
      this.$el.find('iframe')
        .one('load', $.proxy(this.iframeLoaded, this));
        // .on('error', $.proxy(this.iframeError, this));
      
      return this;
    },

    iframeLoaded: function() {
      this.$el.find('.overlay.loading').remove();
    },

    processDwollaResponse: function(response) {
      var self = this;
      var data = {
        id: response._links['funding-source'].href.split('funding-sources/')[1], // id
        status: response._links['verify-micro-deposits'] ? 'unverified' : 'verified'
      };

      var path;
      if (app.session.get('logged_in')) {
        // if already active, just 
        path = 'account/funding_sources';
      } else {
        // if activating, set primary
        path = self.user.get('role') + 's/activate/funding_sources';
      }

      app.utils.request({
        path: path,
        method: 'POST',
        data: data
      }).then(function(data) {
        
        if (data.status === 'unverified') {
          // tell the user they will have to do microdeposits!!
        }

        self.parentView.user.set(data);
        self.parentView.next();
        
      });
    },

    renderAllSet: function() {
      var all_set_message = '<div class="form-model"><h1>Bank Account</h1>';
      all_set_message += '<div class="all-set">You\'ve already linked your bank account!</div>';
      all_set_message += '<div class="pad-20"><a href="#" class="btn action-next">Next</a></div></div>';
      
      this.$el.find('#iav-container').html(all_set_message);
    },

    nextStep: function() {
      this.parentView.next();
    }

  });
});