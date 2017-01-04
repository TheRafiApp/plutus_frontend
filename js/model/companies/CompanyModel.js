/**
 * CompanyModel.js
 */

define([
	'app'
],
function(app) {

	var CompanyModel = app.Model.extend({

    name: 'company',
    displayName: 'name',

    defaults: {
      name: null
    },

    urlRoot: function() {
      return app.API() + 'companies/';
    },

    schema: {
      admin: {
        phone: {
          type: 'phone'
        }
      }
    },

    validation: {
      // company data
      name: {
        required: true
      },

      // manager data
      'admin.first_name': {
        required: true,
        maxLength: 60,
        // pattern: 'alphabetical'
      },
      'admin.last_name': {
        required: true,
        maxLength: 60,
        // pattern: 'alphabetical'
      },
      'admin.email': function(input, field, attributes) {
        if (!input && !attributes.admin.phone) {
          return 'You must enter at least one contact method.';
        } else if (!attributes.admin.phone) {
          if (!app.utils.validateContact(input)) return 'Please enter a valid email address';
        } else {
          if (input) {
            if (!app.utils.validateContact(input)) return 'Please enter a valid email address';
          }
        }
      },
      'admin.phone': function(input, field, attributes) {
       if (!input && !attributes.admin.email) {
          return 'You must enter at least one contact method.';
        } else if (!attributes.admin.email) {
          if (!app.utils.validateContact(input)) return 'Please enter a valid phone number';
        } else {
          if (input) {
            if (!app.utils.validateContact(input)) return 'Please enter a valid phone number';
          }
        }
      }
    }

	});

	return CompanyModel; 

});

/* Sample Data

{
  "name": "Aqua Teen Hunger Force",
  "manager": {
    "first_name": "Fry",
    "last_name": "Lock",
    "email": "fry.lock3@mailinator.com"
  }
}

*/