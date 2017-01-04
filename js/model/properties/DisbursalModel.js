/**
 * DisbursalModel.js
 */

define([
  'app'
],
function(app) {

  var DisbursalModel = app.Model.extend({

    name: 'disbursal',
    displayName: 'date',

    urlRoot: function() {
      return app.API() + 'disbursal/';
    },

    schema: {
      amount: {
        type: 'money'
      },
      date: {
        type: 'ISO'
      }
    }

  });

  return DisbursalModel; 

});