/**
 * DwollaAccountModel.js
 */

define([
	'app'
],
function(app) {

	return app.Model.extend({

    name: 'dwolla account',

    url: function() {
      var logged_in = app.session.get('logged_in');
      var path = logged_in ? 'account/dwolla' : 'admins/activate/dwolla';
      return app.API() + path;
    },

    filters: [
      'dob_day',
      'dob_month',
      'dob_year'
    ],

    schema: {
      dob_month: {
        type: 'dob'
      },
      phone: {
        type: 'phone'
      }
    },

    validation: {
      address1: {
        required: true,
        msg: 'Address is required'
      },
      city: {
        required: true
      },
      state: {
        required: true
      },
      postalCode: {
        required: true,
        msg: 'Zip is required'
      },
      firstName: {
        required: true
      },
      lastName: {
        required: true
      },
      phone: {
        required: true
      },
      dob_month: {
        required: true
      },
      dob_day: {
        required: true
      },
      dob_year: [{
        required: true,
        msg: 'Year is required'
      }, {
        min: '1916',
      }],
      ssn: [{
        required: true,
        msg: 'SSN is required'
      },{
        length: 4,
        msg: 'SSN must be 4 digits'
      }]
    }
	});
});