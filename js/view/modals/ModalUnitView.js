/**
 * ModalUnitView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'model/properties/UnitModel',
  'text!templates/modals/modal-unit.html'
],
function(
  app, 
  ModalView,
  UnitModel, 
  ModalUnitTemplate
) {

  return ModalView.extend({

    title: function() {
      var action = app.utils.capitalize(this.action);
      return action + ' Unit';
    },

    messages: {
      success: 'The unit has been saved',
      error: 'The unit could not be saved'
    },

    template: _.template(ModalUnitTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.parentModel = this.context.parentModel;

      this.model = new UnitModel(null, {
        parentModelId: this.parentModel.get('_id')
      });

      this.renderModalView();
    },

    render: function() {
      var self = this;

      this.ready({
        unit: this.model.toJSON()
      });

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

    confirm: function() {
      var self = this;

      var formData = this.constructData();
      formData.property = this.parentModel.get('_id');

      if (!app.utils.validate(this, formData)) return false;

      this.model.save(formData).then(function() {
        self.context.trigger(self.eventName);
        self.closeModal();
      }).fail(function(e) {
        var error = e.responseJSON;
        var message;
        if (error.message.contains('duplicate', 'key')) {
          message = 'There is already a unit with that number on the property';
        } else {
          message = 'Sorry, unable to create unit at this time.';
        }
        app.alerts.error(message);
        console.warn(arguments);
      });
    }

  });
});