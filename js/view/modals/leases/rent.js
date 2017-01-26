/**
 * rent.js
 */

define([
  'app',
  'model/leases/LeaseModel',
  'view/components/input-calendar',
  'text!templates/modals/leases/rent.html'
],
function(
  app, 
  LeaseModel,
  DateInput,
  StepTemplate
) {

  return Backbone.View.extend({

    className: 'step',

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      // this.parentView.data.tenants = {};

      this.model = new LeaseModel();

      Backbone.Validation.bind(this);

      this.attachEvents();

      this.render();
      this.renderCalendars();
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
        if (this.listening) {
          this.renderCalendars();
        }
      }
    },

    render: function() {
      this.$el.html(this.template());

      app.controls.maskMoney(this.$el.find('.rent'), this);

      return this;
    },

    renderCalendars: function() {
      if (this.fetched) {
        var start = moment(this.parentView.data.lease.start_date);
        
        this.start_date = new DateInput({
          input: this.$el.find('.first_bill_date'),
          context: this,
          selected: start,
          overflowEscape: true
        });
      }
    },

    // this is confirmation of next step 
    setData: function(data) {
      this.parentView.data.lease = data;

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

      data['tenants'] = this.parentView.data.tenants;
      data['start_date'] = this.parentView.data.lease.start_date;

      return app.schema.process(data, this.model);
    },


    validate: function() {
      var data = this.constructData();
      console.log(data);
      var validate = app.utils.validate(this, data);
      console.log(validate)

      return validate;
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
    }

  });
});