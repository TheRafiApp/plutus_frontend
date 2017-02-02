/**
 * fees_past.js
 */

define([
  'app',
  'view/modals/ModalStepView',
  'model/leases/LeaseModel',
  'text!templates/modals/leases/fees_past.html'
],
function(
  app, 
  ModalStepView,
  LeaseModel,
  StepTemplate
) {

  return ModalStepView.extend({

    events: {
      'change .fee .toggle': 'toggleFee'
    },

    template: _.template(StepTemplate),

    afterInit: function() {
      // this.model = new LeaseModel();
    },

    afterRender: function() {
      app.controls.maskMoney(this.$el.find('.rent'), this);
    },

    setData: function(data) {
      // this.parentView.data.lease = data;
      this.success();
    },

    // validate: function() {
    //   var data = this.constructData();
    //   return data;
    // },

    toggleFee: function(e) {
      var $checkbox = $(e.currentTarget);
      var val = $checkbox.is(':checked');
      var $input = $checkbox.siblings('.money').children('input');
      if (val) {
        var rent = this.parentView.data.lease.rent;
        $input.val(rent);
      }
      $input.attr('disabled', !val);
    }

  });
});