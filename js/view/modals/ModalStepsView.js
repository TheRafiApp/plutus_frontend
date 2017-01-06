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

    child_views: [],

    title: function() {
      return 'Steps';
    },

    events: {
      'click .action-previous': 'previousStep',
      'click .action-next': 'nextStep'
    },

    currentStep: 1,

    template: _.template(''),
    template_container: _.template(ModalTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.renderModalView();
    },

    renderSteps: function() {
      var self = this;

      this.steps.forEach(function(step) {
        var childView = new step({
          context: self
        });

        self.$el.find('.steps').append(childView.$el);
        self.child_views.push(childView);
      });

      this.setStep(this.currentStep);
      
    },

    previousStep: function() {
      this.setStep(this.currentStep - 1);
    },

    nextStep: function() {
      this.setStep(this.currentStep + 1);
    },

    setStep: function(stepIndex) {
      if (stepIndex < 1 || stepIndex > this.steps.length) return;
      this.currentStep = stepIndex;
      this.$el.find('.active').removeClass('active');
      this.child_views[this.currentStep - 1].$el.addClass('active');
      this.renderCount();
      this.updateButtons();
    },

    renderCount: function() {
      this.$el.find('.count .current').html(this.currentStep);
      this.$el.find('.count .total').html(this.steps.length);
    },

    updateButtons: function() {

      this.$el.find('.action-previous').removeClass('disabled');

      if (this.currentStep === 1) {
        this.$el.find('.action-previous').addClass('disabled');
      } 

      if (this.currentStep === this.steps.length) {
        this.$el.find('.action-next').addClass('confirm').text('Finish');
      } else {
        this.$el.find('.action-next').removeClass('confirm').text('Next');
      }
    }

  });
});