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

		initialize: function(attributes, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options);
      if (!this.options.action) this.options.action = '';
		},

    urlRoot: function() {
      return app.API() + 'transfers/' + this.options.action;
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
      'dwolla_source_id'
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

    address: Backbone.computed('lease', 'number_pretty', 'property', function() {
			if (!this.lease) return;
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
      if (typeof destination !== 'object') return;
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

    // is_from_past_bill: Backbone.computed('bill', 'bill_original', function() {
    //   var bill = this.get('bill');
    //   var bill_original = this.get('bill_original');

    //   if (!bill_original) return false;
    //   if (bill !== bill_original)
    //     return true;
    //   else
    //     return false;
    // }),

    cancelTransfer: function() {
      return app.utils.request({
        path: 'dwolla/transfer/' + this.id + '/cancel',
        method: 'POST'
      });
    }

	});

	return TransferModel;

});
