/**
 * BillModel.js
 */

define([
	'app'
],
function(app) {

	var BillModel = app.Model.extend({
    
    name: 'bill',
    displayName: 'date_pretty',
    
    filters: [
      'address'
    ],

    initialize: function(attributes, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options);
      if (!this.options.base) this.options.base = '';
    },

    urlRoot: function() {
      return app.API() + this.options.base + 'bills/';
    },

    address: Backbone.computed('number_pretty', 'property', function() {
      var property = this.get('property');
      var unit = this.get('number_pretty');
      if (typeof property !== 'object') return;
      // var data = this.toJSON();
      return property.address + ', ' + unit /* + ', ' + property.city + ' ' + property.state */;
    }),

    number_pretty: Backbone.computed('unit', function() {
      var number = this.get('unit.number');
      if (!number) return;
      if (/^[\d]/.test(number)) number = '#' + number;
      return number;
    }),

    date_pretty: Backbone.computed('due_date', function() {
      var due_date = this.get('due_date');
      if (!due_date) return;
      return moment.utc(due_date).format('MM/DD/YYYY');
    }),

    charges_pretty: Backbone.computed('charges', function() {
      var clone = $.extend(true, {}, this.attributes);
      var charges = clone.charges;
      if (_.isEmpty(charges)) return;
      if (charges.scheduled) {
        charges.scheduled = charges.scheduled.map(function(charge) { 
          charge.amount = app.utils.parseMoney(charge.amount);
          return charge;
        });
      }
      if (charges.recurring) {
        charges.recurring = charges.recurring.map(function(charge) { 
          charge.amount = app.utils.parseMoney(charge.amount);
          return charge;
        });  
      }
      
      return charges;
    }),

    status: Backbone.computed('display_balance', 'due_date', function() {
      var balance = this.get('display_balance');
      var due_date = moment.utc(this.get('due_date')).startOf('day');
      var today = moment.utc().startOf('day');
      var state;

      if (!due_date) return;

      if (balance === 0) {
        state = 'paid';
      } else if (due_date < today) {
        state = 'overdue';
      } else if (due_date > today) {
        state = 'created';
      } else if (due_date.isSame(today)) {
        state = 'due';
      }

      return state;
    }),

    message: Backbone.computed('lease', 'display_balance', 'due_date', 'updated', 'status', function() {
      var status = this.get('status');
      var balance = this.get('display_balance');
      var lease = this.get('lease');

      var due_date = moment.utc(this.get('due_date')).startOf('day');
      var updated = moment.utc(this.get('updated')).startOf('day');
      var today = moment.utc().startOf('day');
      var days = Math.abs(moment.duration(due_date.diff(today)).asDays());
      var message;
      var date_output;
      var is_future;

      if (!due_date) return;
      if (!lease) return;

      var has_autopay = _.each(lease.autopay, function(tenant_id) {
        return tenant_id === app.session.user.id;
      });

      if (balance === 0) {
        message = 'Paid in full';
        date_output = updated;
      } else if (due_date < today) {
        message = 'Overdue ' + days + ' days';
        date_output = due_date;
      } else if (due_date > today) {
        message = 'Due in ' + days + ' days';
        date_output = due_date;
        is_future = true;
      } else if (due_date.isSame(today)) {
        message = 'Due today';
        date_output = today;
        is_future = true;
      }

      if (is_future && has_autopay) message = 'Autopay in ' + days + ' days';

      return '<span class="status status-' + status + '">' + message + '</span> ' + date_output.format('MM/DD/YYYY');
    }),

    target: Backbone.computed('type', 'property', 'unit', function() {
      var type = this.get('type');
      var target;

      if (!type) return;

      if (type === 'monthly') {
        var property = this.get('property');
        var unit = this.get('unit');
        target = property.address + ' #' + unit.number;
      } else if (type === 'anytime') {
        var tenants = this.get('tenants');
        if (tenants.length === 1) {
          target = tenants[0].first_name + ' ' + tenants[0].last_name;
        } else {
          target = tenants.length + ' Roommates';
        }
      }
      return target;
    }),

    transfers_by_user: Backbone.computed('transfers', 'tenants', function() { 
      var tenants = this.get('tenants');
      var transfers = this.get('transfers');
      if (!tenants) return;

      var output = {};

      tenants.map(function(tenant) {
        var id = tenant._id;
        var total = 0;
        if (transfers) {
          transfers.map(function(transfer) {
            if (transfer.source == id && !['failed', 'error', 'cancelled'].contains(transfer.status.state)) total += transfer.amount;
          });
        }
        output[id] = total;
      });

      return output;
    }),

    schema: {
      due_date: {
        type: 'ISO'
      },
      charges: {
        scheduled: [{
          amount: {
            type: 'charge'
          },
        }]
      },
      tenants: {
        type: 'array'
      }
    },

    validation: {
      tenants: {
        required: true
      },

      'charges.scheduled': app.utils.validateCharges
    }

	});

	return BillModel; 

});