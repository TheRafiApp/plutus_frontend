/**
 * RentRollModel.js
 */

define([
  'app'
],
function(app) {

  var RentRollModel = app.Model.extend({

    name: 'rent roll entry',
    displayName: 'full_address',

    urlRoot: function() {
      return app.API() + 'rentroll/';
    },

    defaults: {
      today: '',
    },

    filters: [
      'today',
      'active_lease'
    ],

    full_address: Backbone.computed('number', 'property', function() {
      if (this.isNew()) return '';

      var property = this.get('property'); if (!property) return '';

      return _.escape(property.address + ' #' + this.get('number') || '');
    }),

    active_lease: Backbone.computed('today', 'leases', function() {
      if (this.isNew()) return '';
      var leases = this.get('leases');
      if (!leases || leases.length === 0) return false;

      var today = this.get('today');

      if (!today) {
        date = moment.utc();
      } else {
        date = moment.utc(today);
      }

      var active_lease = false;

      leases.forEach(function(lease) {
        if (!lease.end_date) {
          active_lease = lease;
          return;
        } else {
          var start_date = moment.utc(lease.start_date);
          var end_date = moment.utc(lease.end_date);

          if (start_date < date && date < end_date) active_lease = lease;
        }
        
      });

      return active_lease;
    }),

    occupied: Backbone.computed('active_lease', function() {
      if (this.isNew()) return '';
      var active_lease = this.get('active_lease');
      
      return !active_lease ? false : true;
    }),

    income: Backbone.computed('active_lease', function() { 
      if (this.isNew()) return false;

      var active_lease = this.get('active_lease');
      if (typeof active_lease == 'undefined') return false;

      return active_lease ? active_lease.rent : -(this.get('rent'));
    }),

    income_pretty: Backbone.computed('income', function() { 
      var income = this.get('income');
      if (!income) return;
      return app.utils.prettyMoney(income);
    }),

    length: Backbone.computed('active_lease', function() { 
      if (this.isNew()) return '';
      var active_lease = this.get('active_lease');
      if (!active_lease) return null;

      if (!active_lease.end_date) return 'Indefinite';

      var start = moment.utc(active_lease.start_date);
      var end = moment.utc(active_lease.end_date).add('days', 1);

      var duration = moment.duration(end.diff(start));

      return {
        months: duration.asMonths(), 
        days: duration.asDays()
      };
    }),

  });

  return RentRollModel; 

});