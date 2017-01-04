/**
 * TestModel.js
 */

define([
	'app'
],
function(app) {

	return app.Model.extend({

    name: 'company',
    displayName: 'name',

    schema: {
      phone: {
        type: 'phone'
      },
      manager: {
        phone: {
          type: 'phone'
        },
        test: {
          date: {
            type: 'ISO'
          },
          phone: {
            type: 'phone'
          },
          more: {
            phone: {
              type: 'phone'
            },
            date: {
              type: 'ISO'
            },
            amount: {
              type: 'money'
            }
          }
        }
      }
    },

    urlRoot: function() {
      return app.API() + 'companies/';
    }

	});

});

/* Sample Data

{
  phone: '(617) 555-1234'
  manager: {
    phone: '(617) 555-1234',
    test: {
      date: moment(),
      phone: '(617) 555-1234',
      more: {
        phone: '(617) 555-1234',
        date: moment(),
        amount: '$170.00'
      }
    }
  }
}

*/