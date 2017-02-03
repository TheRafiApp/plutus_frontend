/**
 * WebhookView.js
 */

define([
  'app',
  'model/admin/WebhookEventModel',
  'text!templates/webhooks/webhook-event.html',
  'text!templates/headers/header-tertiary-model.html',
],
function(app, WebhookEventModel, Template, HeaderTemplate) {

  return Backbone.View.extend({

    className: 'bill-view scroll-y',

    events: {
      'click .action-close': 'hideTertiary',
      'click .action-get-retries': 'getRetries',
      'click .action-retry': 'retry'
    },

    template: _.template(Template),
    template_container: _.template(HeaderTemplate),

    initialize: function(options) {
      _.extend(this, options);
      var self = this;

      this.model = new WebhookEventModel({ _id: this._id });

      require(['jquery.json-viewer'], function(jsonViewer) {
        self.model.fetch().then(function() {
          self.render();
        });
      });
    },

    // attachEvents: function() {
    //   this.on('transferAdded', this.initialize, this);
    //   this.on('confirmDelete', this.deleteModel, this);
    //   this.listening = true;
    // },

    render: function() {
      var self = this;

      // if (!this.listening) this.attachEvents();

      var data = this.model.toJSON();

      var header_info = {
        model: this.model.display_name()
      };

      this.$el.html(this.template_container({
        header: header_info,
        options: {}
      }));

      this.$el.find('.scroll-y').html(this.template({ 
        webhook: data
      }));

      var attemps_data = this.model.get('attempts');

      this.$el.find('.attemps').jsonViewer(attemps_data, { 
        // collapsed: true, 
        withQuotes: true 
      });

      $('.row[data-id="' + app.views.currentView.selected + '"]').addClass('selected');
      $('.tertiary').removeClass('loading');
      
      return this;
    },

    hideTertiary: function() {
      if (app.views.modelView) app.controls.hideTertiary();
    },

    getRetries: function(event) {
      // var self = this;
      var $container = this.$el.find('.retries');

      this.model.getRetries().then(function(retries) {

        if (!retries.length) {
          $container.html('<li>No retries</li>');
        } else {
          $container.html('');
          retries.forEach(function(retry) {
            $container.append('<li><pre>' + retry + '</pre></li>');
          });
        }

      });
    },

    retry: function(event) {
      var self = this;
      this.model.retry().then(function(response) {
        var message = 'Retrying webhook event successful';
        app.controls.modalConfirm(message, null, self, { cancel: false });
      }).fail(function(error) {
        var message = error.data.message || error.message;
        app.controls.modalConfirm(message, null, self, { cancel: false });
      });
    }

  });
});