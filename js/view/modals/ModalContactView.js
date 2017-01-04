/**
 * ModalContactView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'text!templates/modals/modal-contact.html'
],
function(
  app, 
  ModalView,
  ModalContactTemplate
) {

  return ModalView.extend({

    className: 'user',
    
    'events': {
      'change input.contact': 'validateContact',
    },

    template: _.template(ModalContactTemplate),

    title: function() {
      var action = app.utils.capitalize(this.action); // ie. Edit
      var method = app.utils.capitalize(this.method); // ie. Email

      return action + ' ' + method;
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var data = this.context.model.toJSON();
      var AccountModel = app.models.AccountModel;
      
      this.model = new AccountModel(data, {
        action: this.method
      });

      this.renderModalView();
    },

    render: function() {
      var self = this;
      
      var contact;
      var notify = this.context.model.get('notifications.' + [this.method]);

      if (this.method === 'phone') {
        contact = this.context.model.get('phone');
      } else if (this.method === 'email') {
        contact = this.context.model.get('email');
      }

      this.ready({
        action: this.action, 
        method: this.method,
        contact: contact,
        notify: notify
      });

      // mask code
      this.$el.find('.code').mask('ZZZ–ZZZ', {
        'translation': {
          Z: {
            pattern: /[A-Za-z0-9]/
          },
        }
      });

      this.$el.find('.modal').addClass('start');

      if (this.action === 'verify') {
        this.$el.find('.modal').removeClass('start').addClass('sent');
        this.$el.find('input.contact').prop('disabled', true);
      }

      return this;
    },

    confirm: function() {
      if (this.$el.find('.modal').hasClass('start')) {
        this.submitContact();
      } else if (this.$el.find('.modal').hasClass('sent')) {
        this.verifyContact();
      }
    },
    
    constructData: function() {
      // can't efficiently use serializeObject here because we need to extend 
      // the existing preferences
      
      var valid = this.validateContact();
      if (!valid) return;

      var user = this.model.clone();
      var val = this.$el.find('#notifications').is(':checked') ? true : false;

      var data = valid;
      // data.notifications = _.extend({}, user.get('notifications'));
      data.notifications = {};
      data.notifications[this.method] = val;

      return app.schema.process(data, this.model);
    },

    validateContact: function() {
      var $contact = this.$el.find('input.contact');
      var valid = app.utils.validateContact($contact.val(), true);

      if (valid) {
        this.$el.find('.contact-display').text($contact.val());
        return valid;
      } else {
        app.controls.fieldError({
          element: $contact,
          error: 'Please enter valid contact data'
        });
        return false;
      }
    },

    submitContact: function() {

      var self = this;

      var contactData = this.constructData();
      if (!contactData) return;

      // HACK: gotta unset the contact field on the client side to make sure it
      // will still send if the contact method is the same as the old one
      
      var new_contact = contactData[this.method];
      var old_data = this.model.toJSON();

      if (old_data.authentication) {
        if (new_contact !== old_data.authentication[this.method] &&
        new_contact === old_data[this.method]) {
          this.model.unset(this.method);
        }
      }

      app.controls.loadLock(true);

      this.model.save(contactData).always(function() {

        app.controls.loadLock(false);

      }).then(function(response) {

        var message = '';

        if (response.action === 'authentication_request_sent') {
          message = 'Thanks, we sent you a';
          message += self.method === 'phone' ? ' text message' : 'n email';
          message += ' with a verification code.';
        } else {
          message += 'Thank you, your contact preferences have been updated.';
        }

        app.alerts.success(message);

        self.$el.find('.modal').removeClass('start').addClass('sent');
        self.$el.find('input.contact').prop('disabled', true);

        // self.action = 'verify';
        // self.render();
        // app.views.currentView.currentTab.initialize({ refresh: true });
        // app.views.currentView.initialize();
        // self.closeModal();

      }).fail(function(error) {
        app.controls.handleError(error);
        // self.closeModal();
      });
    },

    verifyContact: function() {
      var self = this;
      var code = $.trim(this.$el.find('.code').val().toUpperCase());

      var $contact = this.$el.find('input.contact');
      var contactData = app.utils.validateContact($contact.val(), true);
      contactData.code = code;

      app.session.verifyCode(contactData).then(function(response) {
        self.closeModal();
        app.views.currentView.currentTab.initialize({ refresh: true });
        app.alerts.success('Your contact information has been verified!');
      }).fail(function() {
        app.alerts.error('Something went wrong');
      });
    }

  });
});