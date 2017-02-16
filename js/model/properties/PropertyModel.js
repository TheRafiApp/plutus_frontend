/**
 * PropertyModel.js
 */

define([
  'app'
],
function(app) {

  var PropertyModel = app.Model.extend({

    name: 'property',
    displayName: 'full_address',

    urlRoot: function() {
      return app.API() + 'properties/';
    },

    validateOnServer: function(data) {
      var self = this;
      return app.utils.request({
        method: 'POST',
        path: self.urlRoot() + 'validate',
        data: data
      });
    },

    // schema: {
    //   address: {
    //     type: 'address'
    //   }
    // },

    filters: [
      // 'address',
      'full_address',
      'vacancies',
      'pay_into_target'
    ],

    full_address: Backbone.computed('address', 'city', 'state', 'zip', 'country', function() {
      if (this.isNew()) return '';
      var address = this.get('address') + ', ';
      address += this.get('city')  + ', ';
      address += this.get('state') + ' ';
      address += this.get('zip') + ', ';
      address += this.get('country');
      return _.escape(address);
    }),

    vacancies: Backbone.computed('units', function() {
      if (this.isNew()) return '';
      var vacancies = 0;
      var vacancy_losses = 0;
      var units = this.get('units');
      if (!units) return '';

      units.forEach(function(unit) {
        var active_leases = 0;

        if (!unit.leases) return;

        unit.leases.forEach(function(lease) {
          var start_date = moment(lease.start_date);
          var end_date = moment(lease.end_date);

          // this has to be switched out for a customizable date
          var date = moment();

          if (start_date < date < end_date) active_leases++;
        });

        if (active_leases === 0) {
          vacancies++;
          vacancy_losses = vacancy_losses + parseInt(unit.rent);
        }
      });

      return {
        vacant_units: vacancies,
        vacancy_losses: vacancy_losses
      };
    }),

    number_of_units: Backbone.computed('units', function() {
      if (this.isNew()) return '';
      var number_of_units = 0;
      var units = this.get('units');
      if (!units) return '';
      return units.length;
    }),

    validation: {
      address: {
        required: true
      },
      city: {
        required: true
      },
      state: {
        required: true
      },
      zip: {
        required: true,
        pattern: 'zip'
      }
    }

  });

  return PropertyModel; 

});