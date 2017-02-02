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

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

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

      this.model.fetch().then(function() {
        self.render();
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

      $('.row[data-id="' + app.views.currentView.selected + '"]').addClass('selected');
      $('.tertiary').removeClass('loading');
      
      return this;
    },

    hideTertiary: function() {
      if (app.views.modelView) app.controls.hideTertiary();
    },

    getRetries: function(event) {
      this.model.getRetries().then(function(response) {
        console.log(response);
      });
    },

    retry: function(event) {
      this.model.retry().then(function(response) {
        console.log(response);
      });
    }

  }));
});