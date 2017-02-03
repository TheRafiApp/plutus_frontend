/**
 * WebhookModel.js
 */

define([
  'app',
  'model/users/UserModel',
],
function(app, UserModel) {

  var WebhookModel = app.Model.extend({

    name: 'webhook event',
    displayName: 'topic',

    urlRoot: function() {
      return app.API() + 'dwolla/webhooks';
    },

    getRetries: function() {
      var self = this;
      return app.utils.request({
        path: self.url() + '/retries',
        method: 'GET'
      });
    },

    retry: function() {
      var self = this;
      return app.utils.request({
        path: self.url() + '/retries',
        method: 'POST'
      });
    },

    type: Backbone.computed('customer', function() {
      var customer = this.get('customer');
      if (!customer) return;
      
      var type = customer.name ? 'company' : 'user';
      return type;
    }),

    customer_label: Backbone.computed('customer', 'type', function() {
      var customer = this.get('customer');
      var type = this.get('type');
      if (!customer) return;
      
      var customer_label;

      if (type === 'company') {
        customer_label = customer.name;
      } else if (type === 'user') {
        customer_label = customer.first_name + ' ' + customer.last_name;
      }

      return customer_label;
    }),

    user: Backbone.computed('customer', 'type', function() {
      var customer = this.get('customer');
      var type = this.get('type');
      if (type !== 'user') return;

      return new UserModel(customer);
    }),

  });

  return WebhookModel; 

});