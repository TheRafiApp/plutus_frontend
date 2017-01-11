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
        self.context.unlock();
      });

      this.context.lock();
      this.render();

      return this;
    },

    render: function() {

      // this.on('next', this.next, this);

      this.$el.html(this.template({
        properties: this.collection.toJSON()
      }));

      return this;
    },

    toggleModelType: function() {
      this.parentView.toggleModelType();
    },

    validate: function() {
      var data = this.$el.find('form').serializeObject();
      if (!data._id) return false;
      return data;
    },

    next: function() {
      var data = this.validate();
      if (!data) return;

      this.parentView.setData(data);
    }
    
  });
});