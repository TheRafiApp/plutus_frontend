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

      this.model = new UnitModel();

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
      var data = this.constructData();

      var validate = app.utils.validate(this, data);
      if (!validate) return false;

      return data;
    },

    next: function() {
      var data = this.validate();

      if (!data) return;

      this.parentView.setData(data);
    }
    
  });
});