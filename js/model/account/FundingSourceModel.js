/**
 * FundingSourceModel.js
 */

define([
	'app'
],
function(app) {

	var FundingSourceModel = app.Model.extend({

    idAttribute: 'id',

    name: 'funding source',
    displayName: 'name',

    urlRoot: function() {
      return app.API() + 'account/funding_sources';
    },

    defaults: {
      name: null,
      type: 'bank'
    },
    
    validation: {
      name: {
        required: true
      },
      accountNumber: {
        pattern: 'number',
        minLength: 8,
        maxLength: 17
      },
      routingNumber: {
        pattern: 'number',
        length: 9
      }
    },

    is_primary: Backbone.computed('id', function() {
      var id = this.get('id');
      if (!id) return;

      var dwolla_account = app.session.user.get('dwolla_account');
      var primary_id = dwolla_account.primary_funding_source;

      if (id === primary_id) return true;
    }),

    // micro deposits
    schema: {
      amount1: {
        value: {
          type: 'money'
        }
      },
      amount2: {
        value: {
          type: 'money'
        }
      }
    },

    fetchMicroDeposits: function(data) {
      var url = this.url() + '/microdeposits';

      return app.utils.request({
        data: data,
        path: url,
        method: 'GET'
      });
    },

    sendMicroDeposits: function(data) {
      var url = this.url() + '/microdeposits';

      return app.utils.request({
        data: data,
        path: url,
        method: 'PUT'
      });
    },

    requestMicroDeposits: function(data) {
      var url = this.url() + '/microdeposits';

      return app.utils.request({
        data: data,
        path: url,
        method: 'POST'
      });
    },

    setPrimary: function() {
      var data = {
        id: this.get('id'),
        // name: this.get('name')
      };

      return app.utils.request({
        data: data,
        path: 'account/funding_sources',
        method: 'PUT'
      });
    }
	});

	return FundingSourceModel; 

});

