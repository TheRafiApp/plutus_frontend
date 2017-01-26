/**
 * dates.js
 */

define([
  'app',
  'model/leases/LeaseModel',
  'view/components/input-calendar',
  'text!templates/modals/leases/dates.html'
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

    events: {
      'change input[name="type"]': 'typeChange'
    },

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

      return this;
    },

    renderCalendars: function() {
      if (this.fetched) {
        var start = moment().add('months', 1).startOf('month').startOf('day'); // next first of the month
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
      data['rent'] = 1;

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