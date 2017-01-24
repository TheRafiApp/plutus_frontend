/**
 * TransferModel.js
 */

define([
	'app'
],
function(app) {

	var TransferModel = app.Model.extend({

    name: 'transfer',
    displayName: 'amount_pretty',

    urlRoot: function() {
      return app.API() + 'transfers/';
    },

    schema: {
      amount: {
        type: 'transfer'
      },
      date: {
        type: 'ISO'
      }
    },

    validation: {
      amount: app.utils.validateMoney
    },

    filters: [
      'amount_pretty',
      'amount_int',
      'source_name',
      'destination_name',
      'dwolla_created',
      'dwolla_destination_id',
      'dwolla_id',
      'dwolla_resource_id',
      'dowlla_source_id'
    ],

    search_filters: [
      '_id',

      'bill_id',
      'company_id',

      'destination',
      'destination_id',

      'dwolla_created',
      'dwolla_destination_id',
      'dwolla_id',
      'dwolla_resource_id',
      'dwolla_source_id',

      'source',
      'source_id',

      'created',
      'updated'
    ],

    source_name: Backbone.computed('source', function() {
      if (this.isNew()) return '';
      var source = this.get('source');
      if (!source) return;
      return source.first_name + ' ' +  source.last_name;
    }),

    destination_name: Backbone.computed('destination', function() {
      if (this.isNew()) return '';
      var destination = this.get('destination');
      if (!destination) return;
      return destination.first_name + ' ' +  destination.last_name;
    }),

    amount_pretty: Backbone.computed('amount', function() {
      var amount = this.get('amount');
      if (this.isNew() || !amount) return '';

      return app.utils.prettyMoney(amount);
    }),

    amount_int: Backbone.computed('amount', function() {
      var amount = this.get('amount.value');
      if (this.isNew() || !amount) return '';

      return parseFloat(amount);
    }),

    // cancellable_until: Backbone.computed('created', function() {
    //   var created = this.get('created');
    //   if (!created) return;

    //   var created_moment = moment.utc().utcOffset('-06:00');
    //   var time_of_day = moment.utc(created_moment.format('HH:mm'), 'HH:mm');

    //   var cancellable_until;

    //   cancellable_until = moment.utc(created_moment.startOf('day').add('hours', 16));

    //   // after 4pm?
    //   if (time_of_day > moment.utc('16:00', 'HH:mm').utcOffset('-6:00')) {
    //     cancellable_until = moment.utc(cancellable_until.add('days', 1)).utcOffset('-6:00');
    //   }

    //   return cancellable_until;
    // }),

    cancelTransfer: function() {
      // var cancellable_until = this.get('cancellable_until');

      // if (moment.utc() > moment.utc(cancellable_until)) 
        // throw new Error('This transfer is outside the cancellation window');

      return app.utils.request({
        path: 'dwolla/transfer/' + this.id + '/cancel',
        method: 'POST'
      });
    }

	});

	return TransferModel; 

});