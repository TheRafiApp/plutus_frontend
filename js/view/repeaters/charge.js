/**
 * /repeaters/charge.js
 */

define([
  'app',
  // 'model/leases/ChargeModel',
  'text!templates/repeaters/charge-input.html',
  'text!templates/repeaters/date-input.html',
],
function(app, ChargeTemplate, DateTemplate) {

  return Backbone.View.extend({

    tagName: 'li',

    events: {
      'click .action-delete': 'closeView',
      'change .charge': 'validateCharge'
    },

    template: _.template(ChargeTemplate),

    initialize: function(options) {

      this.options = {
        type: true, 
        description: true
      };
      _.extend(this, options);

      // this.model = new ChargeModel();
      this.render();
    },

    render: function() {
      var self = this;

      // Backbone.Validation.bind(this);

      // console.log(this.type, this.name)

      this.$el.html(this.template({
        amount: this.amount,
        id: this.id,
        type: this.type,
        name: this.name,
        options: this.options
      }));

      app.controls.maskMoney('.charge', this);
      app.controls.smartTextarea(this);

      if (this.type == 'scheduled') {
        var dateinput = _.template(DateTemplate);
        this.$el.prepend(dateinput({ 
          name: this.name,
          id: this.id
        }));

        var $date_field = this.$el.find('.date');

        var selected_date = this.date ? moment(this.date) : moment();

        this.date = new Kalendae.Input($date_field[0], {
          months: 1,
          direction: 'today-future',
          selected: selected_date,
        });

        this.date.subscribe('show', function() {
          self.context.trigger('calendar-open');
        });
      }
      return this;
    },

    validateCharge: function(e) {
      var amount = $(e.currentTarget).val();
      var invalid = app.utils.validateMoney(amount);
      
      if (invalid) {
        app.controls.fieldError({
          element: $(e.currentTarget),
          type: 'error',
          error: invalid
        });
      }
    },

    closeView: function() {
      if (!this.indexKey) this.indexKey = 'chargeCounter';

      if (this.context[this.indexKey] === this.min) return;
      this.context[this.indexKey]--;
      this.close();
    }

  });
});