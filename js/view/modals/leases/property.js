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

      this.attachEvents();

      return this.render();
    },

    attachEvents: function() {
      if (!this.listening) {
        this.listening = true;
        this.on('next', this.next, this);
      }
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
      this.render();
    },

    // this is confirmation of next step 
    setData: function(data) {
      console.log('------- setData() -------')
      this.parentView.data.property = data;

      // console.log('property', this.context)

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