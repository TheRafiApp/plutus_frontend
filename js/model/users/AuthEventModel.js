/**
 * AuthEventModel.js
 */

define([
  'app'
],
function(app) {

  var AuthEventModel = app.Model.extend({

    name: 'authentication event',
    displayName: 'type',

    // urlRoot: function() {
    //   return app.API() + 'users/' + this.options.parentModelId + '/authentication';
    // },

    // schema: {
    //   rent: {
    //     type: 'money'
    //   }
    // },

    // filters: [
    //   'full_address',
    //   'sq_ft_int',
    //   'rent_pretty',
    //   'number_pretty'
    // ],

    // number_pretty: Backbone.computed('number', function() {
    //   var number = this.get('number');
    //   if (!number) return;
    //   if (/^[\d]/.test(number)) number = '#' + number;
    //   return number;
    // })

  });

  return AuthEventModel; 

});