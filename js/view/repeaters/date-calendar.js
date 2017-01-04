/**
 * /repeaters/date-calendar.js
 */

define([
  'app',
  'kalendae',
  'text!templates/repeaters/date-calendar.html',
],
function(app, kalendae, DateTemplate) {

  return Backbone.View.extend({

    template: _.template(DateTemplate),

    // TODO: allow setting date in options
    
    initialize: function(options) {
      _.extend(this, options);
      this.render();
    },

    render: function() {
      var self = this;

      this.$el.html(this.template({
        name: this.name
      }));

      var $date_field = this.$el.find('.calendar-container');

      // Init Kalendae

      this.date = new Kalendae($date_field[0], {
        months: 1,
        selected: moment()
      });

      // Kalendae events

      this.date.subscribe('change' , function(date) {
        self.populateDate(date);
      });

      this.populateDate();

      return this;
    },

    populateDate: function(date) {
      if (!date) date = this.date.getSelectedRaw()[0].format('MM/DD/YYYY');
      this.$el.find('.date-input').val(date);
      this.emitChange();
      return this;
    },

    emitChange: function(e) {
      this.context.trigger('dateChange');
    }
    
  });
});