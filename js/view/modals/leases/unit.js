/**
 * unit.js
 */

define([
  'app',
  'view/modals/leases/unit/new',
  'view/modals/leases/unit/existing',
],
function(
  app, 
  NewView, 
  ExistingView 
) {

  return Backbone.View.extend({

    className: 'step',

    events: {
      'keyup .address-selector': 'handleChange'
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.parentView.data.unit = {};

      this.attachEvents();

      return this.render();
    },

    attachEvents: function() {
      if (!this.listening) {
        this.listening = true;
        this.on('next', this.next, this);
      }
    },

    show: function() {
      this.$el.addClass('active');

      if (!this.fetched) { 
        this.initialize(); 
        this.fetched = true;
      }
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

    // this is confirmation of next step 
    setData: function(data) {
      this.parentView.data.unit = data;
      this.successAnimation();
    },

    successAnimation: function() {
      $('.modal').addClass('loading success');

      var self = this;

      app.controls.wait(1200).then(function() {
        $('.modal').removeClass('loading success');
        self.parentView.nextStep();
      });
    },

    next: function() {
      this.currentView.next();
    },

    lock: function() {
      this.parentView.lock();
    },

    unlock: function() {
      this.parentView.unlock();
    }

  });
});