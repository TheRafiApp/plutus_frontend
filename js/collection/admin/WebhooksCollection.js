/**
 * WebhooksCollection.js
 */

define([
  'app',
  'model/admin/WebhookModel',
],
function(app, WebhookModel) {

  return app.Collection.extend({

    idAttribute: 'id',

    model: WebhookModel,

    url: function() {
      return app.API() + 'dwolla/subscriptions';
    },

    initialize: function(models, options) {
      return this;
    },

  });

});