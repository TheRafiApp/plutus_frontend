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

    validationType: 'lease_dates',

    events: {
      'change input[name="type"]': 'typeChange'
    },

    afterInit: function() {
      this.model = new LeaseModel();
    },

    afterShow: function() {
      this.parentView.data.lease = {};
      this.renderCalendars();
    },

    renderCalendars: function() {
      var self = this;

      var start = moment().add('months', 1).startOf('month').startOf('day');
      var end = moment(start).add('months', 12).subtract('days', 1);
      
      this.start_date = new DateInput({
        input: this.$el.find('.start-date-input'),
        context: this,
        selected: start,
        overflowEscape: true
      });

      this.start_date.on('change', function(date) {
        self.updateEndDate(date);
      }, this);

      this.end_date = new DateInput({
        input: this.$el.find('.end-date-input'),
        context: this,
        selected: end,
        overflowEscape: true
      });
    },

    updateEndDate: function(date) {
      console.log('have to update end date blackout here', date.format('MM/DD/YYYY'))
    },

    setData: function(data) {
      this.parentView.data.lease = data;
      this.success();
    },

    constructData: function() {
      var data = this.$el.find('form').serializeObject();

      data['property'] = this.parentView.data.property._id;
      data['unit'] = this.parentView.data.unit._id;
      data['tenants'] = this.parentView.data.tenants;
      data['rent'] = 1;
      delete data['type'];

      return app.schema.process(data, this.model);
    },

    next: function() {
      var self = this;

      var validate = this.validate().then(function() {
        var data = self.constructData();
        self.setData(data);
      }).fail(function(xhr) {
        var json = xhr.responseJSON;
        if (json && json.error) {
          if (json.error === 'lease_datespan_overlap') {
            if (json.data) {
              if (json.data.existing_lease) {
                var lease = json.data.existing_lease;
                var start = moment.utc(lease.start_date).format('MM/DD/YYYY');
                var end = moment.utc(lease.end_date).format('MM/DD/YYYY');
                app.controls.fieldError({
                  element: self.$el.find('input[name="start_date"]'),
                  error: 'There is an overlapping lease from ' + start + ' - ' + end
                });
              }
            }
          }
        }
        promise.reject();
      });
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