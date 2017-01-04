/**
 * account/onboarding/password.js
 */

define([
  'app',
  'text!templates/account/activate/password.html',
],
function(app, Template) {

  return Backbone.View.extend({

    className: 'password',
    template: _.template(Template),

    events: {
      'click .action-next': 'validate'
    },

    initialize: function(options) {
      if (options) _.extend(this, options);
      this.render();
    },

    render: function() {
      var self = this;

      console.log(this.step)

      this.$el.html(this.template({
        logo: app.templates.logo()
      }));

      app.controls.renderPasswordFields(this);

      return this;
    },

    validate: function() {
      var pw = this.$el.find('.password');
      var pc = this.$el.find('.password-confirm');

      var errors = false;

      if (!pw.val()) {
        // pw.parent().addClass('has-error').find('.help-text').text('Password is required');
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
        // pc.parent().addClass('has-error').find('.help-text').text('Passwords must match');
        app.controls.fieldError({
          element: pc,
          error: 'Passwords must match'
        });
        errors = true;
      }

      if (!pc.val()) {
        // pc.parent().addClass('has-error').find('.help-text').text('Please confirm your password');
        app.controls.fieldError({
          element: pc,
          error: 'Please confirm your password'
        });
        errors = true;
      }

      if (errors) {
        return false;
      } else {
        this.confirm(pw.val());
      }
    },

    confirm: function(password) {
      var self = this;
      var user = this.parentView.user;
      var login = user.email || user.phone;
      var data = {
        password: password
      };
      app.session.setPassword(data).then(function() {
        // self.parentView.password = password;
        // if successful, save login for later
        app.utils.stash.setItem('last-login', login);
        app.utils.stash.setItem('last-pw', password);

        self.parentView.next();
      }).fail(function(error) {
        console.warn(error);
      });
    }

  });
});