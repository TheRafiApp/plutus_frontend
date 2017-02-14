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

    validationType: 'charges',

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
      // this is the last step
      console.log(data);
      console.log(this.parentView.data)

      _.extend(this.parentView.data.lease, data);
      this.success();
    },

    constructData: function() {

      var charges = {
        recurring: [],
        scheduled: [],
      };
      
      this.recurring.forEach(function(view) {
        var charge_data = view.constructData();
        charges.recurring.push(charge_data);
      });

      this.scheduled.forEach(function(view) {
        var charge_data = view.constructData();
        charges.scheduled.push(charge_data);
      });

      console.log(charges);

      var data = {
        charges: charges,
        rent: this.parentView.data.lease.rent,
        tenants: this.parentView.data.tenants,
        start_date: this.parentView.data.lease.start_date,
        end_date: this.parentView.data.lease.end_date
      };

      // data['rent'] = this.parentView.data.lease.rent;
      // data['tenants'] = this.parentView.data.tenants;
      // data['start_date'] = this.parentView.data.lease.start_date;
      // data['end_date'] = this.parentView.data.lease.end_date;

      // console.log(data);

      return app.schema.process(data, this.model);
    },

    // validateOnServer: function(data) {
    //   delete data.tenants;
    //   delete data.start_date;
    //   delete data.end_date;
    //   delete data.rent
    //   return this.model.validateOnServer(data, this.validationType);
    // },

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