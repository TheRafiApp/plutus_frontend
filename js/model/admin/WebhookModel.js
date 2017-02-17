/**
 * WebhookModel.js
 */

define([
  'app'
],
function(app) {

  var WebhookModel = app.Model.extend({

    name: 'funding source',
    displayName: 'url',

    idAttribute: 'id',

    urlRoot: function() {
      return app.API() + 'dwolla/subscriptions';
    },

    validation: {
      url: {
        pattern: 'url'
      }
    }

  });

  return WebhookModel; 

});