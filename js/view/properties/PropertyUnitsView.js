/**
 * /properties/PropertyUnitsView.js
 */

define([
  'app',
  'collection/leases/LeasesCollection',
  'collection/properties/PropertiesCollection',
  'collection/properties/UnitsCollection',
  'text!templates/properties/property_units.html'
],
function(
  app, 
  LeasesCollection,
  PropertiesCollection, 
  UnitsCollection, 
  PropertyUnitsTemplate
) {

  return Backbone.View.extend({

    className: 'property-units',

    events: {
      'change select.properties': 'propertyChange',
      'change select.units': 'unitChange'
    },

    template: _.template(PropertyUnitsTemplate),

    verifyCollection: function(collection) {
      if (collection.length < 1) return false;
      else return true;
    },

    renderError: function(collectionName) { 
      this.context.renderError(
        'It looks like you don\'t have any ' + 
        collectionName + 
        ', you need to have a property, unit, and active lease before you can create a bill.'
      );
    },

    initialize: function(options) {
      if (options) _.extend(this, options);
      var self = this;

      this.properties = new PropertiesCollection();
      this.properties.fetch().then(function() {
        if (!self.verifyCollection(self.properties)) return self.renderError('properties');

        self.selected_property = self.selected_property || self.properties.first().get('_id');
        self.units = new UnitsCollection(null, {
          parentModelId: self.selected_property
        });
        self.units.fetch().then(function() {
          if (!self.verifyCollection(self.units)) return self.renderError('units');

          self.render();
        });
      });
    },

    render: function() {

      // only show properties that have units
      
      this.properties = this.filterProperties();

      // if specified, only show units that have active leases
      
      if (this.activeOnly) this.units = this.filterUnits();

      this.$el.html(this.template({
        selected_property: this.selected_property,
        selected_unit: this.selected_unit,
        properties: this.properties.toJSON(),
        units: this.units.toJSON()
      }));

      this.$el.find('.chosen').chosen({ width: '100%' });

      this.delegateEvents();

      this.context.trigger('addressChanged');

      return this;
    },

    filterProperties: function() {
      var filtered = this.properties.filter(function(property) {
        var units = property.get('units');
        return units && units.length !== 0;
      });
      return new PropertiesCollection(filtered);
    },

    filterUnits: function() {
      var filtered = this.units.filter(function(unit) {
        var check = true;
        var leases = unit.get('leases');

        if (leases.length === 0) check = false;

        var hasActiveLeases = false;

        leases = new LeasesCollection(leases);

        leases.each(function(lease) {
          if (lease.active) hasActiveLeases = true;
        });

        if (!hasActiveLeases) check = false;

        return check;
      });
      return new UnitsCollection(filtered);
    },

    propertyChange: function() {
      var self = this;
      var value = this.$el.find('select.properties').val();

      this.selected_property = value;
      this.units.reset();
      this.units = new UnitsCollection(null, {
        parentModelId: value
      });

      this.units.fetch().success(function() {
        self.render();
      });
      
    },

    unitChange: function() {
      this.context.trigger('addressChanged');
    }
   
  });
});