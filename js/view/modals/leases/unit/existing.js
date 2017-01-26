/**
 * modals/leases/unit/existing.js
 */

define([
  'app',
  'collection/properties/UnitsCollection',
  'text!templates/modals/leases/unit/existing.html'
],
function(
  app, 
  UnitsCollection, 
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

      this.collection = new UnitsCollection(null, {
        parentModelId: this.parentModelId
      });

      if (this.parentModelId) {
        this.collection.fetch().then(function() {
          self.render();
          self.parentView.unlock();
        });
      }

      this.parentView.lock();
      this.render();

      return this;
    },

    render: function() {

      // this.on('next', this.next, this);

      this.$el.html(this.template({
        units: this.collection.toJSON()
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