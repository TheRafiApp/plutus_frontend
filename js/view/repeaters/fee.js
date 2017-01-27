/**
 * repeaters/fee.js
 */

define([
  'app',
  'view/components/input-calendar',
  'text!templates/repeaters/fee.html'
],
function(app, DateInput, StepTemplate) {

  return Backbone.View.extend({

    events: {
      'click .action-close': 'closeView'
    },

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.render();

      return this;
    },

    render: function() {
      this.$el.html(this.template({
        scheduled: this.scheduled
      }));

      app.controls.maskMoney(this.$el.find('.money input'), this);

      if (this.scheduled) this.renderCalendar();

      return this;
    },

    renderCalendar: function() {
      this.date = new DateInput({
        input: this.$el.find('.due-date-input'),
        context: this,
        selected: this.selected,
        overflowEscape: true
      });
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
      var FeesArray;
      if (this.scheduled) {
        FeesArray = this.parentView.recurring;
      } else {
        FeesArray = this.parentView.scheduled;
      }
      FeesArray.splice(FeesArray.indexOf(this), 1);
    }
    
  });
});