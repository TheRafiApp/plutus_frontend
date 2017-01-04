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
      'click .action-delete': 'promptDelete'
    },

    template: _.template(WebhookTemplate),

    initialize: function() {
      var self = this;
      this.on('confirmDelete', this.confirmDelete, this);
      this.render();
    },

    render: function() {
      var self = this;
      var data = this.model.toJSON();
 
      this.$el.html(this.template({ webhook: data }))

      return this;
    },

    promptDelete: function() {
      var target = this.model.get('url')
      var message = 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    },

    confirmDelete: function() {
      var self = this;

      var data = {
        url: self.model.get('url')
      }

      data = JSON.stringify(data);

      this.model.destroy({ 
        data: data
      }).then(function() {
        self.$el.fadeOut(function() {
          delete self;
        });
        //self.parentView.render();
      }, function() {
        console.log(arguments)
        app.alerts.error('Couldn\'t delete the webhook')
      })
    }

  });
});