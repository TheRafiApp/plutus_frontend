/**
 * WebhookEventsCollection.js
 */

define([
  'app',
  'model/admin/WebhookEventModel',
],
function(app, WebhookEventModel) {

  return Backbone.Collection.extend({

    model: WebhookEventModel,

    url: function() {
      return app.API() + 'webhooks';
    }

  });

});