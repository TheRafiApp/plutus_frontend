/**
 * modals/leases/unit/new.js
 */

define([
  'app',
  'model/properties/UnitModel',
  'text!templates/modals/leases/unit/new.html'
],
function(app, UnitModel, StepTemplate) {

  return Backbone.View.extend({

    events: {
      'click .action-toggle': 'toggleModelType',
      'blur .money input': 'validateAmount'
    },

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.model = new UnitModel(null, {
        parentModelId: this.parentModelId
      });

      Backbone.Validation.bind(this);

      this.render();

      return this;
    },

    render: function() {
      this.$el.html(this.template({
        unit: this.parentView.parentView.data.unit,
        existingIsDisabled: this.existingIsDisabled
      }));

      var decimals = this.$el.find('input[name="beds"], input[name="baths"]');
      decimals.mask('zzzz', {
        translation: {
          'z': {
            pattern: /[0-9\.]/
          }
        }
      });

      var number = this.$el.find('input[name="sq_ft"]');
      number.mask('000000');

      return this;
    },

    toggleModelType: function() {
      this.parentView.toggleModelType();
    },

    constructData: function() {
      var data = this.$el.find('form').serializeObject();

      data['rent'] = 1; // were going to collect this data later

      if (this.parentModelId) data['property'] = this.parentModelId;

      return app.schema.process(data, this.model);
    },

    validate: function() {
      var self = this;

      var promise = app.utils.promises(1)[0];

      var data = this.constructData();
      if (!data) return promise.reject();
      
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

      var validate = this.validate().then(function() {
        var data = self.constructData();
        self.parentView.setData(data);
      }).fail(function(xhr) {
        var json = xhr.responseJSON;
        if (json && json.error) {
          if (json.error === 'pymongo_duplicate_key_error') {
            app.controls.fieldError({
              element: 'input[name="number"]',
              error: 'There is already a unit with that number in this property'
            });
          }
        }
      });
    }
    
  });
});