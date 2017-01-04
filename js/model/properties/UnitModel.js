/**
 * UnitModel.js
 */

define([
  'app'
],
function(app) {

  var UnitModel = app.Model.extend({

    name: 'unit',
    displayName: 'number_pretty',

    urlRoot: function() {
      return app.API() + 'properties/' + this.options.parentModelId + '/units';
    },

    schema: {
      rent: {
        type: 'money'
      }
    },

    filters: [
      'full_address',
      'sq_ft_int',
      'rent_pretty',
      'number_pretty'
    ],

    number_pretty: Backbone.computed('number', function() {
      var number = this.get('number');
      if (!number) return;
      if (/^[\d]/.test(number)) number = '#' + number;
      return number;
    }),

    rent_pretty: Backbone.computed('rent', function() {
      var rent = this.get('rent');
      if (!rent) return;
      
      return app.utils.prettyMoney(rent);
    }),

    sq_ft_int: Backbone.computed('sq_ft', function() {
      var sq_ft = this.get('sq_ft');
      if (!sq_ft) return;
      
      return parseFloat(sq_ft);
    }),

    full_address: Backbone.computed('number_pretty', 'property', function() {
      var property = this.get('property');
      if (!property) return;
      if (typeof property === 'string') return;
      // console.log(property)

      var country = property.country ? ', ' + property.country : '';

      return property.address + ' #' + this.get('number_pretty') + ', ' + property.city + ', ' + app.utils.stateAbbr(property.state) + ' ' + property.zip + country;
    }),

    validation: {
      number: {
        required: true
      },
      property: {
        required: true
      },
      beds: function(input, field, attributes) {
        var check = input % 1;
        if (isNaN(check) || check !== check) return 'Please enter a valid number';
      },
      baths: function(input, field, attributes) {
        var check = input % 1;
        if (isNaN(check) || check !== check) return 'Please enter a valid number';
      },
      rent: function(input, field, atributes) {
        // this field is optional, but if it is specified, it should validate
        if (typeof input === 'undefined') return;
        return app.utils.validateMoney(input);
      }
    }

  });

  return UnitModel; 

});