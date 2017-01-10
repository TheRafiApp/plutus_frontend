/**
 * property.js
 */

define([
  'app',
  'view/modals/leases/property/new',
  'view/modals/leases/property/existing',
],
function(
  app, 
  PropertyNewView, 
  PropertyExistingView 
) {

  return Backbone.View.extend({

    className: 'step',

    events: {
      'keyup .address-selector': 'handleChange'
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.render();
    },

    render: function() {
      var PropertyView;
      if (this.modelIsNew === undefined) {
        this.modelIsNew = false;
      }

      PropertyView = this.modelIsNew ? PropertyNewView : PropertyExistingView;

      this.currentView = new PropertyView({
        context: this.context,
        parentView: this
      });
      this.$el.html(this.currentView.$el);

      return this;
    },

    toggleModelType: function() {
      this.modelIsNew = !this.modelIsNew;
      this.render();
    }

  });
});