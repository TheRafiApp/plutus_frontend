/**
 * modals/leases/property/existing.js
 */

define([
  'app',
  'collection/properties/PropertiesCollection',
  'text!templates/modals/leases/property/existing.html'
],
function(
  app, 
  PropertiesCollection, 
  StepTemplate
) {

  return Backbone.View.extend({

    events: {
      'click .action-toggle': 'toggleModelType'
    },

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.collection = new PropertiesCollection();

      this.collection.fetch().then(function() {
        self.render();
        self.parentView.unlock();
      });

      this.parentView.lock();
      this.render();

      return this;
    },

    render: function() {

      this.$el.html(this.template({
        properties: this.collection.toJSON()
      }));

      return this;
    },

    toggleModelType: function() {
      this.parentView.toggleModelType();
    },

    constructData: function() {
      var _id = this.$el.find('select[name="_id"]').val();

      var model = this.collection.find({
        _id: _id
      });

      return model.toJSON();
    },

    next: function() {

      var data = this.constructData();

      this.parentView.setData(data);
    }
    
  });
});