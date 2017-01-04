/**
 * MyBillModel.js
 */

define([
  'app',
  'model/bills/BillModel'
],
function(app, BillModel) {

  return BillModel.extend({

    urlRoot: function() {
      return app.API() + 'account/bills';
    },

    schema: {
      amount: {
        type: 'money'
      }
    },

    validation: {
      amount: function(input, field, attributes) {
        if (!input) 
          return 'Please enter an amount.';
        if (+input > +attributes.total) 
          return 'You have entered an amount that exceeds the balance of the bill.';
      }
    }
  });

});