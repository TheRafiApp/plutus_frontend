/**
 * ActivateView.js
 */

define([
  'app',
  'text!templates/account/account-activation.html',
],
function(app, ActivationTemplate) {

  return Backbone.View.extend({

    className: 'activation dark',
    template: _.template(ActivationTemplate),

    events: {
      'click .breadcrumb': 'goToStep'
    },

    dwolla_data: {},

    initialize: function(options) {
      if (options) _.extend(this, options);

      // if user data was not passed, use session user
      var AccountModel = app.models.AccountModel;

      // make sure we have a real AccountModel instance
      this.user = this.user ? new AccountModel(this.user) : app.session.user;
      
      // if user is not active yet, clear session tokens
      if (this.user.get('status.active') === false) {
        app.utils.stash.removeItem('authorization');
        app.utils.stash.removeItem('refresh');
      } else {
        if (app.session.get('logged_in') === false) {
          app.router.navigate('/', { trigger: true, replace: true });
          return app.alerts.error('You have already activated your account, please log in');
        }
      }

      this.$el.html(this.template());
      this.$el.append(app.templates.logo());

      this.render();

      return this;
    },

    updateUser: function(userData) {
      _.extend(this.user, userData);
      this.initialize();
    },

    render: function() {
      $('body').removeClass('loading');
      var self = this;

      this.renderSteps();

      return this;
    },

    checkStep: function() {
      // loop thru steps and evaluate status
      for (var i=0; i<this.steps.length; i++) {
        var currentStep = this.steps[i];
        if (!currentStep.value) {
          // call the method of the first step that isnt complete
          this.currentStep = currentStep;
          this.showStep(currentStep);
          break;
        }
        // if all steps are done
        if (i === (this.steps.length - 1)) this.loginAndClose();
      }
    },

    renderSteps: function() {
      this.steps = app.utils.getOnboardingSteps(this.user.toJSON());

      console.log(this.steps)

      // render breadcrumbs
      if (this.steps.length > 1) {
        for (var i=0; i<this.steps.length; i++) {
          
          var $breadcrumb = $('<a>', {
            'href': '#',
            'class': 'breadcrumb',
            'data-name': this.steps[i].name,
            'data-step': i
          });
          this.$el.find('.breadcrumbs').append($breadcrumb);
        }
      }

      this.$el.find('.container').append($('<div class="fade"></div>'));
      this.fade = this.$el.find('.fade');

      this.checkStep();
    },

    showStep: function(step) {
      var self = this;

      app.utils.loadView.get('account/activate/' + step.name).then(function(stepView) {
        self.currentView = new stepView({
          step: step,
          parentView: self
        });

        // update background color
        var color = step.options.background;
        self.$el.css('background-color', color)
          .find('.step')
          .html(self.currentView.$el);
        
        // update overflow fade
        self.fade.css('box-shadow', 'inset 0 -19px 10px -12px ' + color);

        self.updateBreadcrumbs(step);
        self.$el.find('.container').removeClass('loading');
      });
    },

    updateBreadcrumbs: function(step) {
      var index = step.index;

      this.$el.find('.breadcrumb').removeClass('current');
      for (var i=0; i<=index; i++) this.$el.find('.breadcrumb[data-step="' + i + '"]').addClass('active');
      this.$el.find('.breadcrumb[data-step="' + index + '"]').addClass('current');
    },

    next: function() {
      var self = this;
      var nextIndex = this.currentStep.index + 1;
      if (nextIndex > (this.steps.length - 1)) {
        this.loginAndClose();
        return;
      }

      this.currentStep = this.steps[nextIndex];
      this.showStep(this.currentStep);
    },

    loginAndClose: function() { 
      var self = this;
      app.router.checkAuth().then(function() {
        self.close();
      }).fail(function() {
        app.controls.login().then(function() {
          self.close();
        });
      });
    },

    goToStep: function(e) {
      var index = $(e.currentTarget).attr('data-step');
      this.currentStep = this.steps[index];
      this.showStep(this.currentStep);
    },

    setDwollaData: function(data) {
      _.extend(this.dwolla_data, data);
    }

  });
});