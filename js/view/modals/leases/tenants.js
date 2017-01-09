/**
 * tenants.js
 */

define([
  'app',
  'collection/users/TenantsCollection',
  'text!templates/modals/leases/tenants.html'
],
function(app, TenantsCollection, StepTemplate) {

  return Backbone.View.extend({

    className: 'step',

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.collection = new TenantsCollection();

      this.collection.fetch().then(function() {
        self.render();
      });
    },

    render: function() {
      
      this.$el.html(this.template({
        tenants: this.collection.toJSON()
      }));

      return this;
    }

  });
});