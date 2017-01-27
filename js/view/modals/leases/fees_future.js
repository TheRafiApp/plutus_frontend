/**
 * fees_past.js
 */

define([
  'app',
  'view/modals/ModalStepView',
  'view/repeaters/fee',
  'model/leases/LeaseModel',
  'text!templates/modals/leases/fees_future.html'
],
function(
  app, 
  ModalStepView,
  FeeRepeater,
  LeaseModel,
  StepTemplate
) {

  return ModalStepView.extend({

    events: {
      'click .action-add-recurring': 'addRecurring',
      'click .action-add-scheduled': 'addScheduled'
    },

    template: _.template(StepTemplate),

    afterInit: function() {
      this.model = new LeaseModel();
      this.recurring = [];
      this.scheduled = [];
    },

    setData: function(data) {
      // this.parentView.data.lease = data;
      this.success();
    },

    constructData: function() {
      var data = this.$el.find('form').serializeObject();
      return data;
    },

    validate: function() {
      var data = this.constructData();

      return data;
    },

    next: function() {
      var validate = this.validate();

      if (!validate) return;

      var data = this.constructData();
      this.setData(data);
    },

    addRecurring: function() {
      var newView = new FeeRepeater({
        parentView: this
      });

      this.recurring.push(newView);

      this.$el.find('.recurring').append(newView.$el);
    },

    addScheduled: function() {
      var date = this.parentView.data.lease.start_date;
      var newView = new FeeRepeater({
        parentView: this,
        scheduled: true,
        selected: date
      });

      this.scheduled.push(newView);

      this.$el.find('.scheduled').append(newView.$el);
    },


  });
});