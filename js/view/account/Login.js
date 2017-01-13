/**
 * LoginView.js
 */

define([
  'app',
  'text!templates/account/login.html'
],
function(app, LoginTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'login-container',

    events: {
      'click .action-login': 'loginRequest',
      'change #remember-me': 'toggleRemember',
      'submit form.begin': 'submitForgot',
      'submit form.end': 'submitCode',
      'submit form.reset-code': 'submitReset',
      'submit form.reset-token': 'submitResetToken',
    },

    initialize: function() {
      this.on('showLogin', this.showLogin, this);
      this.on('showForgot', this.showForgot, this);
      this.on('showReset', this.showReset, this);
      this.on('sendToken', this.sendToken, this);
      this.on('saveToken', this.saveToken, this);

      return this.render();
    },

    render: function() {
      var logged_in = app.session.get('logged_in');

      if (!logged_in) {
        this.template = _.template(LoginTemplate);
        var user = app.utils.stash.getItem('last-login') || '';
        var pw = app.utils.stash.getItem('last-pw') || '';
        
        this.$el.html(this.template({
          logo: app.templates.logo(),
          user: user,
          pw: pw
        }));

        $('body').removeClass('loading');

        app.controls.renderPasswordFields(this);

        this.toggleRemember();

        // mask code
        this.$el.find('.code').mask('ZZZ–ZZZ', {
          'translation': {
            Z: {
              pattern: /[A-Za-z0-9]/
            },
          }
        });
      
        return this.$el;
      } else {
        this.close();
      }
    },

    validateContact: function(string) {
      delete this.phone;
      delete this.email;

      var validate = app.utils.validateContact(string, true);

      if (validate.phone) {
        this.phone = validate.phone;
        return 'phone';
      } else if (validate.email) {
        this.email = validate.email;
        return 'email';
      } else {
        app.alerts.error('Please enter a valid email or phone');
        return false;
      }
    },

    // Send the login request
    loginRequest: function(e) {
      e.preventDefault();

      app.utils.stash.removeItem('activation');

      var username = this.$el.find('.login .username').val();

      var valid = this.validateContact(username);
      var key;
      var value = this.email || this.phone;

      if (!valid) {
        return false;
      } else {
        key = valid;
      }

      var loginData = {
        'password': $('.login .password').val()
      };

      loginData[key] = value;

      var errors = [];

      for (var k in loginData) {
        if (!loginData[k]) {
          $('.' + k).parent().addClass('error');
          errors.push(app.utils.capitalize(k));
        }
      }

      if (errors.length > 0) {
        if (errors.length > 1) {
          app.alerts.error('You have omitted required fields: ' + errors.join(', '));
        } else {
          app.alerts.error(errors + ' is a required field');
        }
        return false;
      }

      this.rememberForget();

      app.controls.login(loginData);

    },

    // Remember me checkbox
    toggleRemember: function(event) {
      if (this.$el.find('#remember-me').is(':checked')) {
        app.utils.stash.setItem('remember-me', true);
      } else {
        app.utils.stash.setItem('remember-me', false);
      }
      this.rememberForget();
    },

    rememberForget: function() {
      if (app.utils.stash.getItem('remember-me') == 'true') {
        var user = this.$el.find('.username').val();
        var pw = this.$el.find('.password').val();
        app.utils.stash.setItem('last-login', user);
        app.utils.stash.setItem('last-pw', pw);
      } else {
        app.utils.stash.removeItem('last-login');
        app.utils.stash.removeItem('last-pw');
      }
    },

    // Show the login form
    showLogin: function() {
      this.$el.find('.login').addClass('visible');
      this.$el.find('.forgot, .reset').removeClass('forgot-sent visible');
    },

    // Show Step 1 of forgot password
    showForgot: function() {
      this.$el.find('.login, .reset').removeClass('visible');
      var $forgot_form = this.$el.find('.forgot').removeClass('end').addClass('visible begin');
      $forgot_form.find('.reset-code .code').removeAttr('required');
      $forgot_form.find('.username').prop('disabled', false);

      // focus on next field
      this.$el.find('.username').focus();
    },

    // Show Step 2 of forgot password
    showForgot2: function() {
      var $forgot_form = this.$el.find('.forgot').addClass('end').removeClass('begin');
      $forgot_form.find('.reset-code .code').val('').attr('required', 'required').focus();
      $forgot_form.find('.username').prop('disabled', true);

      // focus on next field
      this.$el.find('.code').focus();
    },

    // Show Step 3 of forgot password
    showReset: function() {
      this.$el.find('.login').removeClass('visible');
      var $forgot_form = this.$el.find('.forgot').removeClass('visible end').addClass('begin');
      $forgot_form.find('.reset-code .code').removeAttr('required');
      var $reset_form = this.$el.find('.reset').addClass('visible');

      // focus on next field
      this.$el.find('.password').focus();
    },

    // Send form 1
    submitForgot: function(e) {
      e.preventDefault();

      var self = this;

      var username = this.$el.find('.forgot .username').val();
      var valid = this.validateContact(username);
      var key;
      var value = this.email || this.phone;

      if (!valid) {
        return false;
      } else {
        key = valid;
      }

      var forgotData = {};

      forgotData[key] = value;

      app.session.postPassword(forgotData).then(function() {

        var message = 'Thanks, we sent you a';
        message += key === 'phone' ? ' text message' : 'n email';
        message += ' with a verification code.';

        app.alerts.success(message);
        self.showForgot2();

      }).fail(function(error) {
        app.controls.handleError(error);
      });
    },

    // Send form 2
    submitCode: function(e) {
      e.preventDefault();

      var self = this;
      var value = this.email || this.phone;
      var key = this.email ? 'email' : 'phone';

      var code = $.trim(this.$el.find('.forgot .code').val().toUpperCase());

      if (code.length !== 7) {
        app.alerts.error('Please enter a valid code.');
        return false;
      }

      var forgotData = {
        'code': code
      };

      forgotData[key] = value;

      app.session.putPassword(forgotData).then(function(response) {
        app.alerts.success('Please enter a new password');

        self.code = code;

        self.showReset();
      }).fail(function() {
        app.alerts.error('The code you have entered is invalid.');
      });
    },

    // Send form 3
    submitReset: function(e) {
      e.preventDefault();

      var self = this;
      var value = this.email || this.phone;
      var key = this.email ? 'email' : 'phone';
      var code = this.code;

      if (!this.validatePassword()) return;

      var password = this.$el.find('.reset .password').val();

      var resetData = {
        'password': password,
        'code': code
      };

      resetData[key] = value;

      this.verifyLogin(resetData);
    },

    // Submit Token to reset
    submitResetToken: function(e) {
      e.preventDefault();

      var self = this;
      var value = this.email || this.phone;
      var key = this.email ? 'email' : 'phone';
      var token = this.token;

      if (!this.validatePassword()) return;

      var password = this.$el.find('.reset .password').val();

      var resetData = {
        'password': password,
        'token': token
      };

      resetData[key] = value;

      this.verifyLogin(resetData);
    },

    validatePassword: function(e) {
      var pw = this.$el.find('.reset .password');
      var pc = this.$el.find('.reset .password-confirm');

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

    sendToken: function() {
      var self = this;

      var tokenData = {
        token: app.url.query_string()
      };

      // send token and trigger events
      app.session.putPassword(tokenData).then(function(response) {
        self.user = response;
        self.trigger('showReset');
        self.trigger('saveToken');
      }).fail(function() {
        app.alerts.error('Your reset link has expired');
        app.router.navigate('/', { trigger: true, replace: true });
      });
    },

    // Save that reset token to this view
    saveToken: function() {
      this.token = window.location.search.slice(1);
      this.$el.find('.reset').removeClass('reset-code').addClass('reset-token');
    },

    verifyLogin: function(resetData) {
      var self = this;
      app.session.putPassword(resetData).then(function(response) {
        app.alerts.success('Password succesfully reset!');
        var value;
        var key;

        if (response) {
          value = response.email || response.phone;
          key = response.email ? 'email' : 'phone';
        } else {
          value = self.email || self.phone;
          key = self.email ? 'email' : 'phone';
        }

        var loginData = {
          'password': resetData.password
        };

        loginData[key] = value;

        // Log the user in
        app.controls.login(loginData);

      }).fail(function(error) {
        app.controls.handleError(error);
      });
    }

  }));
});