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

    title: function() {
      return 'Steps';
    },

    updateTitle: function(_subtitle) {
      var subtitle = '';
      if (_subtitle) subtitle = ' - ' + _subtitle;

      this.$el.find('header h2').html(this.title() + subtitle);
    },

    events: {
      'click .overlay': 'easyClose',
      'click .action-previous': 'handlePrevious',
      'click .action-next': 'handleNext'
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
          parentView: self
        });

        self.$el.find('.steps').append(childView.$el);
        self.child_views.push(childView);
      });

      this.setStep(this.currentIndex);
      
    },

    handlePrevious: function() {
      this.previousStep();
    },

    handleNext: function() {
      this.child_views[this.currentIndex].trigger('next');
    },

    previousStep: function() {
      this.setStep(this.currentIndex - 1);
    },

    nextStep: function() {
      this.setStep(this.currentIndex + 1);
    },

    setStep: function(stepIndex) {
      if (stepIndex < 0 || stepIndex > (this.steps.length - 1)) return;

      app.views.appView.closeCalendarInputs();
      
      this.currentIndex = stepIndex;
      this.$el.find('.active').removeClass('active');

      this.child_views[this.currentIndex].show();
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

    changed: function() {
      return _.some(this.data, function(obj) {
        return !_.isEmpty(obj);
      });
    }

  });
});