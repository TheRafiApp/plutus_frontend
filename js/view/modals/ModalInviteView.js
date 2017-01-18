/**
 * ModalInviteView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'text!templates/modals/modal-invite.html'
],
function(app, ModalView, ModalInviteTemplate) {

  return ModalView.extend({

    title: function() {
      return this.action + ' ' + this.role;
    },

    template: _.template(ModalInviteTemplate),

    messages: {
      success: 'The user was successfully invited',
      error: 'The user could not be invited'
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      // dynamically choose model
      this.role = app.utils.capitalize(this.context.modelName);

      // all roles get invited except superadmins
      var action = this.role === 'superadmin' ? '' : 'invite';

      // load the model
      app.utils.loadModel.get('users/' + this.role + 'Model').then(function(UserModel) {
        self.model = new UserModel(null, { action: action });

        app.controls.fetchAll(self).then(function() {
          self.renderModalView();
        });
      });
    },

    render: function() {
      var self = this;

      var companies = app.collections.companies && app.collections.companies.toJSON();

      this.ready({
        companies: companies
      });

      return this;
    },


    // TODO: move this 
    handleError: function(e) {
      var self = this;

      var error = e.responseJSON;
      var message;

      var key;
      // user already exists
      if (error.error === 'pymongo_duplicate_key_error') {
        message = 'There is already a user with that ';

        if (error.data.index_name === 'phone') {
          key = 'phone';
          message += 'phone number.';
        } else if (error.data.index_name === 'email') {
          key = 'email';
          message += 'email address.';
        }

        console.log(key);

        // user was previously removed
        if (error.data.removed) {
          if (confirm('This user was previously removed, would you like to un-remove them?')) {

            console.log(key, error.data.removed['_id']);
            self.model.set(error.data.removed);

            self.model.unremove().then(function() {
              self.context.trigger(self.eventName);
              self.closeModal();
            }).fail(function(e) {
              app.alerts.error('Sorry, we were unable to unremove that user.');
              console.warn(e);
            });
          }
          return;
        }

      } else {
        message = 'Sorry, unable to create user at this time.';
      }

      console.warn(message);

      app.alerts.error(message)
    }

  });
});