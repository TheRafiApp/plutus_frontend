/**
 * property.js
 */

define([
  'app',
  'view/modals/ModalStepView',
  'view/modals/leases/property/new',
  'view/modals/leases/property/existing',
],
function(
  app, 
  ModalStepView,
  NewView, 
  ExistingView 
) {

  return ModalStepView.extend({

    events: {
      'change input': 'changed',
      'change select': 'changed',
    },

    changed: function() {
      var steps = this.parentView.child_views;
      var thisIndex = steps.indexOf(this);

      steps.forEach(function(step, index) {
        if (index === (thisIndex + 1)) step.initialized = false;
      });
    },
    
    beforeRender: function() {
      this.parentView.data.property = {};
      this.parentView.updateTitle();
    },

    render: function() {      
      if (this.modelIsNew === undefined) this.modelIsNew = false;

      var ChildView = this.modelIsNew ? NewView : ExistingView;

      this.currentView = new ChildView({
        parentView: this
      });

      this.$el.html(this.currentView.$el);

      return this;
    },

    toggleModelType: function() {
      this.modelIsNew = !this.modelIsNew;
      this.changed();
      this.render();
    },

    beforeNextStep: function() {
      var property_address = this.parentView.data.property.address;
      this.parentView.updateTitle(property_address);
    },

    setData: function(data) {
      this.parentView.data.property = data;
      this.success();
    },

    next: function() {
      this.currentView.next();
    }

  });
});