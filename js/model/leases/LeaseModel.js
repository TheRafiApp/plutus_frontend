/**
 * LeaseModel.js
 */

define([
  'app'
],
function(app) {

  var LeaseModel = app.Model.extend({

    name: 'lease',
    displayName: 'lease',

    initialize: function(attributes, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      _.extend(this.options, options);

      if (!this.options.action) this.options.action = '';
    },

    urlRoot: function() {
      return app.API() + 'leases/' + this.options.action;
    },

    schema: {
      rent: {
        type: 'money'
      },
      tenants: {
        type: 'array'
      },
      start_date: {
        type: 'ISO'
      },
      end_date: {
        type: 'ISO'
      },
      charges: {
        scheduled: [{
          amount: {
            type: 'charge'
          },
          date: {
            type: 'ISO'
          }
        }],
        recurring: [{
          amount: {
            type: 'charge'
          }
        }]
      },
      // for data import only
      first_month: {
        type: 'money'
      },
      last_month: {
        type: 'money'
      },
      security: {
        type: 'money'
      },
      split: {
        type: 'money_or_zero'
      }
    },

    filters: [
      'lease',
      'term',
      'address',
      'address_short',
      'length',
      'number_pretty',
      'start_moment',
      'end_moment',
      'first_month',
      'last_month'
    ],

    start_moment: Backbone.computed('start_date', function() {
      var start_date = this.get('start_date');
      if (!start_date) return;
      return moment.utc(start_date);
    }),

    end_moment: Backbone.computed('end_date', function() {
      var end_date = this.get('end_date');
      if (!end_date) return;
      return moment.utc(end_date);
    }),

    number_pretty: Backbone.computed('unit', function() {
      var number = this.get('unit.number');
      if (!number) return;

      if (/^[\d]/.test(number)) number = '#' + number;
      return number;
    }),

    address_short: Backbone.computed('property', 'number_pretty', function() {
      var property = this.get('property');
      var number = this.get('number_pretty');
      if (!property || !number) return;
      return property.address + ' ' + number;
    }),

    address: Backbone.computed('property', 'number_pretty', function() {
      var property = this.get('property');
      var number = this.get('number_pretty');
      if (!property || !number) return;
      if (typeof property === 'string') return;
      return property.address + ' ' + number + ', ' + property.city + ' ' + app.utils.stateAbbr(property.state);
    }),

    term: Backbone.computed('start_moment', 'end_moment', function() {
      var start = this.get('start_moment');
      if (!start) return;

      start = start.format('MM/DD/YY');
      var end = this.get('end_moment') ? this.get('end_moment').format('MM/DD/YY') : 'N/A';

      if (!start) return;

      return start + ' – ' + end;
    }),

    lease: Backbone.computed('term', 'address', function() {
      var address = this.get('address');
      var term = this.get('term');

      if (!term) return;
      if (!address) return;

      return address + ', ' + term;
    }),

    length: Backbone.computed('start_date', 'end_date', function() { 
      if (this.isNew()) return '';
      var start = this.get('start_moment');
      var end = this.get('end_moment');

      if (!start) return;

      // NOTE: moment assumes inclusive range, we need exclusive, so we need to 
      // add a day to the end date to calculate length

      if (!end) return 'N/A';
      var duration = moment.duration(end.diff(start));

      // round to the nearest .5 and remove the decimal if zero
      var months = parseFloat((Math.round(duration.asMonths() * 2) / 2).toFixed(1));
      var days = duration.asDays();

      var auto = months > 1 ? months + ' Months' : days + ' Days';

      return {
        months: months,
        days: days,
        auto: auto
      };
    }),

    first_month: Backbone.computed('charges', function() { 
      var charges = this.get('charges.scheduled');
      if (!charges) return;

      charges = charges.filter(function(charge) {
        return charge.type == 'first_month' ? true : false;
      });

      return charges.length === 1 ? charges[0] : false;
    }),

    last_month: Backbone.computed('charges', function() { 
      var charges = this.get('charges.scheduled');
      if (!charges) return;

      charges = charges.filter(function(charge) {
        return charge.type == 'last_month' ? true : false;
      });

      return charges.length === 1 ? charges[0] : false;
    }),

    active: Backbone.computed('start_moment', 'end_moment', function() {
      var start_moment = this.get('start_moment');
      if (!start_moment) return;

      var today = moment.utc();
      return this.containsDate(today);

    }),

    containsDate: function(date) {
      var date_to_check = moment.utc(date);
      var start_moment = this.get('start_moment');
      var end_moment = this.get('end_moment');

      if (!end_moment && start_moment < date_to_check) return true;

      if (start_moment <= date_to_check && date_to_check <= end_moment) {
        return true;
      } else {
        return false;
      }
    },

    validation: {
      unit: {
        required: true
      },
      start_date: {
        required: true
      },
      tenants: {
        required: true
      },
      rent: app.utils.validateMoney,

      'charges.scheduled': app.utils.validateCharges,
      'charges.recurring': app.utils.validateCharges
    }

  });

  return LeaseModel; 

});