/**
 * WebhookEventsCollection.js
 */

define([
  'app',
  'model/admin/WebhookEventModel',
],
function(app, WebhookEventModel) {

  return app.Collection.extend({

    model: WebhookEventModel,

    url: function() {
      return app.API() + 'dwolla/webhooks';
    },

    initialize: function(models, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options); 

      this.on('sync', this.reverse, this);

      if (!this.options.base) this.options.base = '';
    },

    reverse: function() {
      this.models = this.models.reverse();
    }

  });

});