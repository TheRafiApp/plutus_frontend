/**
 * modals/leases/tenants/new.js
 */

define([
  'app',
  'model/users/TenantModel',
  'text!templates/modals/leases/tenants/new.html'
],
function(app, TenantModel, StepTemplate) {

  return Backbone.View.extend({

    events: {
      'click .action-close': 'closeView'
    },

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.model = new TenantModel();

      Backbone.Validation.bind(this);

      this.render();

      return this;
    },

    render: function() {
      this.$el.html(this.template());

      return this;
    },

    constructData: function() {
      var data = this.$el.find('form').serializeObject();

      return app.schema.process(data, this.model);
    },

    validate: function() {
      var data = this.constructData();

      var validate = app.utils.validate(this, data);
      if (!validate) return false;

      return data;
    },

    closeView: function() {
      this.close();
      var TenantsArray = this.parentView.new_tenants;
      TenantsArray.splice(TenantsArray.indexOf(this), 1);
    }
    
  });
});