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

    // initialize: function(_options) {
    //   if (_options) _.extend(this, _options);

    //   // this.parentView.data.tenants = {};

    //   this.model = new LeaseModel();

    //   Backbone.Validation.bind(this);

    //   this.attachEvents();

    //   this.render();
    // },

    afterInit: function() {
      this.model = new LeaseModel();
    },

    afterRender: function() {
      app.controls.maskMoney(this.$el.find('.rent'), this);
    },

    // render: function() {
    //   this.$el.html(this.template());

    //   app.controls.maskMoney(this.$el.find('.money input'), this);

    //   return this;
    // },

    setData: function(data) {
      // this.parentView.data.lease = data;

      this.success();
    },

    // successAnimation: function() {
    //   $('.modal').addClass('loading success');

    //   var self = this;

    //   app.controls.wait(1200).then(function() {
    //     $('.modal').removeClass('loading success');
    //     self.parentView.nextStep();
    //   });
    // },

    // constructData: function() {
    //   var data = this.$el.find('form').serializeObject();

    //   // data['tenants'] = this.parentView.data.tenants;
    //   // data['start_date'] = this.parentView.data.lease.start_date;
    //   return data;
    //   // return app.schema.process(data, this.model);
    // },

    validate: function() {
      var data = this.constructData();

      console.log(data);
      
      return data;
    },

    // next: function() {
    //   var validate = this.validate();

    //   if (!validate) return;

    //   var data = this.constructData();
    //   this.setData(data);
    // },

    // lock: function() {
    //   this.parentView.lock();
    // },

    // unlock: function() {
    //   this.parentView.unlock();
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