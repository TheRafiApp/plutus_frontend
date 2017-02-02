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

      app.utils.prepInputs(this);

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
      var self = this;

      var promise = app.utils.promises(1)[0];

      var data = this.constructData();
      
      if (this.model) {
        validate = app.utils.validate(this, data);
        if (validate) promise = this.validateOnServer(data);
      } else {
        if (validate) {
          promise.resolve();
        } else {
          promise.reject();
        }
      }

      return promise;
    },

    validateOnServer: function(data) {
      return this.model.validateOnServer(data);
    },

    next: function() {
      var self = this;

      var promise = app.utils.promises(1)[0];

      var validate = this.validate().then(function() {
        promise.resolve();
      }).fail(function(xhr) {
        var json = xhr.responseJSON;
        if (json && json.error) {
          if (json.error === 'pymongo_duplicate_key_error') {
            if (json.data) {
              var key;
              if (json.data.email) {
                key = 'email';
              } else if (json.data.phone) {
                key = 'phone';
              }
              app.controls.fieldError({
                element: self.$el.find('input[name="' + key + '"]'),
                error: 'There is already a user with that ' + key
              });
            }
          }
        }
        promise.reject();
      });

      return promise;
    },

    closeView: function() {
      this.close();
      var TenantsArray = this.parentView.new_models;
      TenantsArray.splice(TenantsArray.indexOf(this), 1);
    }
    
  });
});