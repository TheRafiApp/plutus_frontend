/**
 * account/DeclineView.js
 */

define([
  'app',
  'collection/leases/MyLeasesCollection',
  'text!templates/account/account-decline.html',
],
function(app, MyLeasesCollection, DeclineTemplate) {

  return Backbone.View.extend({

    className: 'decline',

    events: {
      'click .action-confirm': 'sendToken',
      'click .action-accept': 'beginActivation'
    },

    template: _.template(DeclineTemplate),

    initialize: function(options) {
      // if (options) _.extend(this, options);
      this.render();
    },

    render: function() {
      var self = this;

      this.$el.html(this.template());
      $('body').removeClass('loading');

      return this;
    },

    beginActivation: function() {
      var query_string = app.url.query_string();
      app.router.navigate('/activate?' + query_string, { trigger: true, replace: false });
    },

    sendToken: function() {
      var self = this;

      var query_string = app.url.query_string();
      var tokenData = {
        token: query_string
      };

      app.session.declineInvitation(tokenData).then(function() {
        self.showConfirm();
      }).fail(function(error) {
        app.alerts.error('Sorry, something went wrong...');
      });
    },

    showConfirm: function() {
      this.$el.find('.visible').removeClass('visible');
      this.$el.find('.confirmation').addClass('visible');
    }

  });
});