/**
 * ModalStepsView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'text!templates/modals/modal-steps.html'
],
function(app, ModalView, ModalTemplate) {

  return ModalView.extend({

    // child_views: [],

    title: function() {
      return 'Steps';
    },

    events: {
      'click .action-previous': 'previousStep',
      'click .action-next': 'nextStep'
    },

    currentIndex: 0,

    template: _.template(''),
    template_container: _.template(ModalTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.renderModalView();
    },

    renderSteps: function() {
      var self = this;

      this.child_views = [];

      this.steps.forEach(function(step) {
        var childView = new step({
          context: self
        });

        self.$el.find('.steps').append(childView.$el);
        self.child_views.push(childView);
      });

      this.setStep(this.currentIndex);
      
    },

    previousStep: function() {
      this.setStep(this.currentIndex - 1);
    },

    nextStep: function() {
      this.setStep(this.currentIndex + 1);
    },

    setStep: function(stepIndex) {
      if (stepIndex < 0 || stepIndex > (this.steps.length - 1)) return;
      this.currentIndex = stepIndex;
      this.$el.find('.active').removeClass('active');

      this.child_views[this.currentIndex].$el.addClass('active');
      this.renderCount();
      this.updateButtons();
    },

    renderCount: function() {
      this.$el.find('.count .current').html(this.currentIndex + 1);
      this.$el.find('.count .total').html(this.steps.length);
    },

    updateButtons: function() {

      // First step
      if (this.currentIndex === 0) {
        this.$el.find('.action-previous').addClass('disabled');
      } else {
        this.$el.find('.action-previous').removeClass('disabled');
      }

      // Last step
      if (this.currentIndex === (this.steps.length - 1)) {
        this.$el.find('.action-next').addClass('confirm').text('Finish');
      } else {
        this.$el.find('.action-next').removeClass('confirm').text('Next');
      }
    },

    lock: function() {
      this.$el.find('.content').addClass('loading');
    },

    unlock: function() {
      this.$el.find('.content').removeClass('loading');
    }

  });
});