/**
 * dates.js
 */

define([
  'app',
  'view/modals/ModalStepView',
  'model/leases/LeaseModel',
  'view/components/input-calendar',
  'text!templates/modals/leases/dates.html'
],
function(
  app, 
  ModalStepView,
  LeaseModel,
  DateInput,
  StepTemplate
) {

  return ModalStepView.extend({

    template: _.template(StepTemplate),

    events: {
      'change input[name="type"]': 'typeChange'
    },

    afterInit: function() {
      this.model = new LeaseModel();
    },

    afterShow: function() {
      
      this.renderCalendars();
    },

    renderCalendars: function() {
      var start = moment().add('months', 1).startOf('month').startOf('day');
      var end = moment(start).add('months', 12).subtract('days', 1);
      
      this.start_date = new DateInput({
        input: this.$el.find('.start-date-input'),
        context: this,
        selected: start,
        overflowEscape: true
      });

      this.end_date = new DateInput({
        input: this.$el.find('.end-date-input'),
        context: this,
        selected: end,
        overflowEscape: true
      });
    },

    setData: function(data) {
      this.parentView.data.lease = data;
      this.success();
    },

    constructData: function() {
      var data = this.$el.find('form').serializeObject();

      data['tenants'] = this.parentView.data.tenants;
      data['rent'] = 1;

      return app.schema.process(data, this.model);
    },

    typeChange: function() {
      var value = this.$el.find('input[name="type"]:checked').val();

      var $end_date = this.$el.find('.end-date-input');
      var $end_date_group = this.$el.find('.end_date_group');

      var isFixed = value === 'fixed';
      var action = isFixed ? 'show' : 'hide';
      $end_date_group[action]();

      $end_date.attr('disabled', !isFixed);
    }

  });
});