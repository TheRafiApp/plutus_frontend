/**
 * ModalLeaseView.js
 */

define([
  'app',
  'view/modals/ModalStepsView',
  'view/modals/leases/property',
  'view/modals/leases/unit',
  'view/modals/leases/dates',
  'view/modals/leases/tenants',
  'view/modals/leases/rent',
  'view/modals/leases/fees_past',
  'view/modals/leases/fees_future',
],
function(
  app, 
  ModalStepsView,
  property, 
  unit, 
  dates,
  tenants,
  rent,
  fees_past,
  fees_future
) {

  return ModalStepsView.extend({

    action: 'add',

    title: function() {
      return this.action + ' Lease';
    },

    steps: [
      property,
      unit,
      dates,
      tenants,
      rent,
      fees_past,
      fees_future
    ],

    defaults: {
      property: {},
      unit: {},
      lease: {},
      tenants: []
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.data = _.extend({}, this.data, this.defaults);

      this.renderModalView();
    },

    render: function() {
      var self = this;

      this.ready();

      self.renderSteps();

      return this;
    }

  });
});