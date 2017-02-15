/**
 * unit.js
 */

define([
  'app',
  'view/modals/ModalStepView',
  'view/modals/leases/unit/new',
  'view/modals/leases/unit/existing',
],
function(
  app, 
  ModalStepView,
  NewView, 
  ExistingView 
) {

  return ModalStepView.extend({

    events: {
      'keyup .address-selector': 'handleChange'
    },
    
    beforeRender: function() {
      this.parentView.data.unit = {};
    },

    render: function() {
      var parentModelData = this.parentView.data.property;

      if (this.modelIsNew === undefined) this.modelIsNew = false;

      var existingIsDisabled = false;

      if (!_.isEmpty(parentModelData)) {
        if (!this.parentView.data.property._id) {
          this.modelIsNew = true;
          existingIsDisabled = true;
        }
      }
    
      var ChildView = this.modelIsNew ? NewView : ExistingView;

      this.currentView = new ChildView({
        parentView: this,
        parentModelId: this.parentView.data.property._id,
        existingIsDisabled: existingIsDisabled
      });

      this.$el.html(this.currentView.$el);

      return this;
    },

    toggleModelType: function() {
      this.modelIsNew = !this.modelIsNew;
      this.render();
    },

    setData: function(data) {
      this.parentView.data.unit = data;
      this.success();
    },


    next: function() {
      this.currentView.next();
    }

  });
});