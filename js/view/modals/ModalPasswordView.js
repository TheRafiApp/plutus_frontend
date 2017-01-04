/**
 * ModalPasswordView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'text!templates/modals/modal-password.html'
],
function(
  app, 
  ModalView,
  ModalPasswordTemplate
) {

  return ModalView.extend({

    'title': 'Change Password',

    'events': {
      'click .action-confirm': 'validatePassword',
    },

    messages: {
      success: 'Your password has been updated',
      error: 'Your password could not be updated'
    },

    template: _.template(ModalPasswordTemplate),
    
    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var data = this.context.model.toJSON();
      
      var AccountModel = app.models.AccountModel;
      this.model = new AccountModel(data, {
        action: 'password'
      });

      this.renderModalView();
    },

    render: function() {
      var self = this; 

      this.ready();

      app.controls.renderPasswordFields(this);

      return this;
    },

    validatePassword: function(e) {
      var pw = this.$el.find('.password');
      var pc = this.$el.find('.password-confirm');

      var errors = false;

      if (!pw.val()) {
        app.controls.fieldError({
          element: pw,
          error: 'Password is required'
        });
        errors = true;
      }

      if (errors) return false;

      if (!Backbone.Validation.patterns.password.test(pw.val())) {
        app.controls.fieldError({
          element: pw,
          error: Backbone.Validation.messages.password
        });
        errors = true;
      }
      
      if (pc.val() !== pw.val()) {
        app.controls.fieldError({
          element: pc,
          error: 'Passwords must match'
        });
        errors = true;
      }

      if (!pc.val()) {
        app.controls.fieldError({
          element: pc,
          error: 'Please confirm your password'
        });
        errors = true;
      }

      if (errors) {
        return false;
      } else {
        this.confirm(e);
      }
    },

    constructData: function() {
      var data = {
        current_password: this.$el.find('.current').val(),
        password: this.$el.find('.password').val()
      };

      return data;
    }
    
  });
});