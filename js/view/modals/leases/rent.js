/**
 * rent.js
 */

define([
  'app',
  'view/modals/ModalStepView',
  'model/leases/LeaseModel',
  'view/components/input-calendar',
  'text!templates/modals/leases/rent.html'
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

    afterInit: function() {
      this.model = new LeaseModel();
    },

    afterRender: function() {
      app.controls.maskMoney(this.$el.find('.rent'), this);
    },

    afterShow: function() {
      this.renderCalendars();
    },

    renderCalendars: function() {
      var start = moment(this.parentView.data.lease.start_date);
      
      this.start_date = new DateInput({
        input: this.$el.find('.first_bill_date'),
        context: this,
        selected: start,
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
      data['start_date'] = this.parentView.data.lease.start_date;

      return app.schema.process(data, this.model);
    }

  });
});