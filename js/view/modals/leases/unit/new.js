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
      'click .action-toggle': 'toggleModelType'
    },

    template: _.template(StepTemplate),

    initialize: function(_options) {

      console.log('init()')
      if (_options) _.extend(this, _options);

      var self = this;

      this.model = new UnitModel();

      Backbone.Validation.bind(this);

      this.render();

      return this;
    },

    render: function() {
      console.log('render()')

      this.$el.html(this.template({
        unit: this.parentView.parentView.data.unit,
        existingIsDisabled: this.existingIsDisabled
      }));

      return this;
    },

    toggleModelType: function() {
      this.parentView.toggleModelType();
    },

    constructData: function() {
      var data = this.$el.find('form').serializeObject();

      return app.schema.process(data, this.model);
    },

    validate: function() {
      var data = this.constructData();

      console.log(data);

      var validate = app.utils.validate(this, data);

      console.log(validate)

      if (!validate) {
        console.warn('didnt validate')
        return false;
      }

      console.log('passed validation')

      return data;
    },

    next: function() {
      var data = this.validate();

      if (!data) return;

      this.parentView.setData(data);
    }
    
    
  });
});