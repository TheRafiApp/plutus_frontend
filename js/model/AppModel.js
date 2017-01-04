/**
 * BaseModel.js
 */

define([
  'app',
  'vendor/backbone-computed.min',
],
function(app) {

  var BaseModel = Backbone.Model.extend({

    idAttribute: '_id',
    name: 'model',

    dependents: [],
    search_filters: [],

    // Return model's displayName
    display_name: function() {
      return this.get(this.displayName);
    },

    initialize: function(attributes, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options);
    },

    // Trim objects
    trim: function(_object) {
      var self = this;
      _.each(_object, function(value, key) {

        var type = typeof value;
        if (type == 'string') {
          if (value === '' || value === undefined) {
            delete _object[key];
          } else {
            _object[key] = $.trim(value);
          }
        } else if (type == 'object') {
          self.trim(value);
        }
      });
    },

    // Override default save to 
    save: function (attributes, options) {
      if (!options) options = {};

      // trim empty fields if new
      if (this.isNew()) this.trim(attributes); 

      // set model with data
      this.set(attributes);

      // set attributes here to be possibly overwritten
      var data = attributes;

      // HACK: I modified backbone.js to allow patch for new models, line 645
      if (options.patch === undefined) options.patch = true;
      options.method = 'POST';

      // if model is not new, check if anything changed
      if (!this.isNew()) {
        if (options.patch === true) {
          var changed_attrs = this.changedAttributes();
          if (!changed_attrs) return $.Deferred().reject({ changed: false });
          data = changed_attrs;  
        }
        options.method = 'PUT';
      }

      // filter out undesired fields
      var filters = this.filters || [];
      data = _.omit(data, filters);

      return Backbone.Model.prototype.save.call(this, data, options);
    },
    
    /*
    
    // check if model has other models that depend on it
    has_dependents: function() {
      var self = this;

      // clone dependents array, since we are about modify it
      var args = this.dependents.slice(0);

      // push callback function into arguments array
      args.push(function() {
        var dependent_models = {};

        // loop through dependent fields to check if they exist
        self.dependents.forEach(function(field) {
          var attr = self.get(field);

          // if models are in object array
          if (attr.constructor === Array) {
            if (attr.length) {
              dependent_models[field] = attr.length;
            }

          // if model is just an attribute
          } else {
            if (attr.constructor === Object) {
              if (!_.isEmpty(attr)) {
                dependent_models[field] = 1;
              }
            }
          }
        });

        return _.isEmpty(dependent_models) ? false : dependent_models;
      });

      // returning computed field should allow this to update dynamically
      return Backbone.computed.apply(self, args);
    }
    */

  });

  return BaseModel; 

});