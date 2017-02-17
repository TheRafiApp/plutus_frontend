/**
 * WebhookView.js
 */

define([
  'app',
  'text!templates/webhooks/webhook.html'
],
function(app, WebhookTemplate) {

  return Backbone.View.extend({

    className: 'webhook',

    events: {
      'click .action-delete': 'promptDelete',
      'click .action-unpause': 'unpause',
      'click .action-pause': 'promptPause'
    },

    template: _.template(WebhookTemplate),

    initialize: function(options) {
      if (options) _.extend(this, options);

      var self = this;
      this.on('confirmDelete', this.delete, this);
      this.on('confirmPause', this.pause, this);
      this.render();
    },

    render: function() {
      var self = this;
      var data = this.model.toJSON();
 
      this.$el.html(this.template({ webhook: data }));

      console.log(this.model)

      return this;
    },

    promptDelete: function() {
      var target = this.model.get('url');
      var message = 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    },

    delete: function() {
      var self = this;

      var data = {
        url: self.model.get('url')
      };

      data = JSON.stringify(data);

      this.model.destroy({ 
        data: data
      }).then(function() {
        self.$el.fadeOut(function() {
          delete self;
        });
        //self.parentView.render();
      }, function() {
        console.log(arguments);
        app.alerts.error('Couldn\'t delete the webhook');
      });
    },

    promptPause: function() {
      var target = this.model.get('url');
      var message = 'Are you sure you want to pause ' + target + '?';

      app.controls.modalConfirm(message, 'confirmPause', this);
    },

    pause: function() {
      var self = this;
      this.setSubscriptionState(true).then(function() {
        self.parentView.initialize();
      }).fail(function() {
        app.alerts.error('Could not pause webhook');
      });
    },

    unpause: function() {
      var self = this;

      this.setSubscriptionState(false).then(function() {
       self.parentView.initialize();
      }).fail(function() {
        app.alerts.error('Could not unpause webhook');
      });
    },

    setSubscriptionState: function(state) {
      return app.utils.request({
        path: 'dwolla/subscriptions/' + this.model.id,
        method: 'PUT',
        data: {
          paused: state
        }
      });
    }

  });
});