/**
 * ModalUnremoveView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'text!templates/modals/modal-unremove.html'
],
function(app, ModalView, ModalUnremoveTemplate) {

  return ModalView.extend({

    title: function() {
      return 'Unremove ' + this.target.name;
    },

    template: _.template(ModalUnremoveTemplate),

    messages: {
      success: 'Unremoved target successfully',
      error: 'The target could not be unremoved'
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      console.log(this);

      this.renderModalView();
    },

    render: function() {
      var self = this;

      this.ready({
        target: this.target
      });

      return this;
    },

    // handleError: function(e) {
    //   var error = e.responseJSON;
    //   var message;

    //   var key;
    //   // user already exists
    //   if (error.message.contains('duplicate', 'key')) {
    //     message = 'There is already a user with that ';

    //     if (error.data.key === 'phone') {
    //       key = 'phone';
    //       message += 'phone number.';
    //     } else if (error.data.key === 'email') {
    //       key = 'email';
    //       message += 'email address.';
    //     }

    //     // user was previously removed
    //     if (error.data.removed) {
    //       if (confirm('This user was previously removed, would you like to un-remove them?')) {

    //         var data = {};
    //         data[key] = formData[key];

    //         self.model.unremove(data).then(function() {
    //           self.context.trigger(self.eventName);
    //           self.closeModal();
    //         }).fail(function(e) {
    //           app.alerts.error('Sorry, we were unable to unremove that user.');
    //           console.warn(e);
    //         });
    //       }
    //       return;
    //     }

    //   } else {
    //     message = 'Sorry, unable to create user at this time.';
    //   }
    // }

  });
});