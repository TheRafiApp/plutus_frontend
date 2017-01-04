/**
 * account/Contact.js
 */

define([
  'app',
  'view/modals/ModalContactView',
  'text!templates/account/account-contact.html'
],
function(app, ModalContactView, AccountContactTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'account account-payment',

    events: {
      'click .action-change-phone': 'changePhone',
      'click .action-change-email': 'changeEmail',
      'click .action-remove-phone': 'promptRemovePhone',
      'click .action-remove-email': 'promptRemoveEmail',
      'click .action-verify-phone': 'verifyPhone',
      'click .action-verify-email': 'verifyEmail',
    },

    template: _.template(AccountContactTemplate),

    initialize: function(options) {
      if (options) _.extend(this, options);

      var self = this;

      this.model = this.parentModel;

      if (this.refresh) {
        this.model.fetch().then(function() {
          self.render();
        });
      } else {
        this.render();
      }
    },

    render: function() {
      this.on('confirmRemovePhone', this.removePhone, this);
      this.on('confirmRemoveEmail', this.removeEmail, this);

      var user = this.model.toJSON();

      this.$el.html(this.template({
        user: user
      }));

      this.delegateEvents();

      if (user.phone_pretty) this.$el.find('.phone-data').mask('(000) 000-0000');

      return this;
    },

    changePhone: function() {
      var action = 'add';
      if (this.model.get('phone') || this.model.get('authentication.phone')) action = 'edit';

      this.modal = new ModalContactView({
        action: action,
        method: 'phone',
        context: this,
      });
    },

    changeEmail: function() {
      var action = 'add';
      if (this.model.get('email') || this.model.get('authentication.email')) action = 'edit';

      this.modal = new ModalContactView({
        action: action,
        method: 'email',
        context: this
      });
    },

    verifyPhone: function() {
      this.modal = new ModalContactView({
        action: 'verify',
        method: 'phone',
        context: this,
      });
    },

    verifyEmail: function() {
      this.modal = new ModalContactView({
        action: 'verify',
        method: 'email',
        context: this,
      });
    },

    promptRemovePhone: function() {
      if (!this.model.get('email')) {
        app.alerts.error('You must have at least one contact method.');
        return;
      }
      var target = this.model.get('phone_pretty');
      var message = 'Are you sure you want to remove your phone number: ' + target + '?';

      app.controls.modalConfirm(message, 'confirmRemovePhone', this);
    },

    promptRemoveEmail: function() {
      if (!this.model.get('phone')) {
        app.alerts.error('You must have at least one contact method.');
        return;
      }
      var target = this.model.get('email');
      var message = 'Are you sure you want to remove your email address: ' + target + '?';

      app.controls.modalConfirm(message, 'confirmRemoveEmail', this);
    },

    removePhone: function() {
      var self = this;
      this.model.options.action = 'phone';
      this.model.destroy().then(function() {
        app.views.currentView.initialize();
      }).fail(function() {
        app.alerts.error('Unable to delete your phone number');
      });
    },

    removeEmail: function() {
      var self = this;
      this.model.options.action = 'email';
      this.model.destroy().then(function() {
        app.views.currentView.initialize();
      }).fail(function() {
        app.alerts.error('Unable to delete your email address');
      });
    }

  }));
});