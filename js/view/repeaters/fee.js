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

      console.log(this.scheduled)

      var array_key = this.scheduled ? 'scheduled' : 'recurring';

      console.log(array_key)

      this.parentArray = this.parentView[array_key];

      this.render();  

      return this;
    },

    render: function() {
      this.$el.html(this.template({
        scheduled: this.scheduled,
        type: this.scheduled ? 'scheduled' : 'recurring',
        id: this.parentArray.length
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

      return app.schema.process(data, null, { 
        amount: { 
          type: 'charge' 
        },
        date: {
          type: 'ISO'
        }
      });
    },

    validate: function() {
      var data = this.constructData();

      var validate = app.utils.validate(this, data);
      if (!validate) return false;

      return data;
    },

    closeView: function() {
      this.close();
      this.parentArray.splice(this.parentArray.indexOf(this), 1);
    }
    
  });
});