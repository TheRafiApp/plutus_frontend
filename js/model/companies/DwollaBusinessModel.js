/**
 * DwollaBusinessModel.js
 */

define([
	'app',
  'model/account/DwollaAccountModel'
],
function(app, DwollaAccountModel) {

	return DwollaAccountModel.extend({

    url: function() {
      var logged_in = app.session.get('logged_in');
      var path = logged_in ? 'company/dwolla' : 'admins/activate/dwolla';
      return app.API() + path;
    },

    initialize: function(attributes, options) {
      // this has to be a deep copy, otherwise if both DwollaAccountModel and
      // DwollaBusinessModel are loaded, they will be referencing each other
      this.validation = _.extend({}, this.validation, this.additionalValidation);
    },

    additionalValidation: {
      businessName: {
        required: true
      },
      businessType: {
        required: true
      },
      ein: {
        required: true,
        length: 10,
        msg: 'EIN must be 9 digits'
      }
    }
	});
});