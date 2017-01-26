/**
 * fees_past.js
 */

define([
  'app',
  'model/leases/LeaseModel',
  'text!templates/modals/leases/fees_future.html'
],
function(
  app, 
  LeaseModel,
  StepTemplate
) {

  return Backbone.View.extend({

    className: 'step',

    events: {
      // 'change .fee .toggle': 'toggleFee'
    },

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      // this.parentView.data.tenants = {};

      this.model = new LeaseModel();

      Backbone.Validation.bind(this);

      this.attachEvents();

      this.render();
    },

    attachEvents: function() {
      if (!this.listening) {
        this.listening = true;
        this.on('next', this.next, this);
      }
    },

    show: function() {
      this.$el.addClass('active');

      if (!this.fetched) { 
        this.fetched = true;
        this.initialize(); 
      } else {
        // if (this.listening) {
        //   this.renderCalendars();
        // }
      }
    },

    render: function() {
      this.$el.html(this.template());

      app.controls.maskMoney(this.$el.find('.money input'), this);

      return this;
    },

    // this is confirmation of next step 
    setData: function(data) {
      // this.parentView.data.lease = data;

      this.successAnimation();
    },

    successAnimation: function() {
      $('.modal').addClass('loading success');

      var self = this;

      app.controls.wait(1200).then(function() {
        $('.modal').removeClass('loading success');
        self.parentView.nextStep();
      });
    },

    constructData: function() {
      var data = this.$el.find('form').serializeObject();

      // data['tenants'] = this.parentView.data.tenants;
      // data['start_date'] = this.parentView.data.lease.start_date;
      return data;
      // return app.schema.process(data, this.model);
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

    lock: function() {
      this.parentView.lock();
    },

    unlock: function() {
      this.parentView.unlock();
    },

  });
});