/**
 * modals/leases/tenants/existing.js
 */

define([
  'app',
  'collection/users/TenantsCollection',
  'text!templates/modals/leases/tenants/existing.html'
],
function(
  app, 
  TenantsCollection, 
  StepTemplate
) {

  return Backbone.View.extend({

    events: {
      'click .action-toggle': 'toggleModelType'
    },

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.collection = new TenantsCollection();

      this.collection.fetch().then(function() {
        self.render();
        self.parentView.unlock();
      });

      this.parentView.lock();
      this.render();

      return this;
    },

    render: function() {
      this.$el.html(this.template({
        tenants: this.collection.toJSON()
      }));

      this.$el.find('.chosen-multiple').chosen();

      return this;
    },

    constructData: function() {
      var tenant_ids = this.$el.find('.tenants').val();
      if (!tenant_ids) return [];

      var all_tenants = this.collection.toJSON();
      var tenants = all_tenants.filter(function(tenant) {
        return tenant_ids.contains(tenant._id);
      });

      return tenants;
    },

    next: function() {

      var data = this.constructData();

      this.parentView.setData(data);
    }
    
  });
});