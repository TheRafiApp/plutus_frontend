/**
 * ModalConfirmView.js
 */

define([
  // 'app',
  'model/account/AccountModel',
  'text!templates/modals/modal-confirm.html'
],
function(
  // app,
  AccountModel,
  ModalConfirmTemplate
) {

  return Backbone.View.extend({

    'events': {
      'click .action-confirm': 'confirm',
      'click .action-cancel': 'closeModal',
      'click .overlay': 'closeModal',
      'keyup': 'keyControl'
    },

    template: _.template(ModalConfirmTemplate),
    
    keyControl: function(e) {
      // e.preventDefault();
      // esc
      if (e.which === 27) {
        this.closeModal();
      // enter
      } else if (e.which === 13) {
        if (this.app.utils.getFocused().parentNode.className.contains('actions')) return;
        this.confirm();
      }
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);
      
      this.model = this.context.model;

      this.app.views.appView.trigger('modalOpened');
      this.app.views.modalView = this;

      this.render();
    },

    render: function() {
      var dialogue = {
        message: this.message
      };

      var self = this;

      var data_summary = Object.keys(this.data).map(function(key, index, array) {
        if (key === 'tenant') return;
        return key + ': ' + self.data[key].length;
      }).join(', ');

      this.$el.html(this.template({
        warning: this.warning(),
        data_summary: data_summary,
        dialogue: dialogue
      }));

      $('.modal-container').html(this.$el).addClass('visible');
      this.$el.find('.password').focus();

      this.delegateEvents();

      return this;
    },

    warning: function() {
      var message;

      if (this.data.tenant) {
        message = 'Deleting this tenant will remove them from their lease';

        if (this.data.leases.length > 1) message += 's';

        message += '!';

      } else {
        message = 'Deleting this ' + this.model.name + ' will also delete its data!';
      }

      return message;
    },

    closeModal: function() {
      $('.modal-container').removeClass('visible');
      this.app.views.appView.trigger('modalClosed');
      this.close();
    },

    refuse: function() {
      this.app.controls.modalShake(this);
    },

    confirm: function(e) {
      // e.preventDefault();
      var self = this;

      // make sure all fields all filled out
      var $confirm = this.$el.find('#confirm'),
          confirm = $confirm.is(':checked');

      if (!confirm) {
        this.app.controls.fieldError({
          element: $confirm,
          type: 'error',
          error: 'Please confirm'
        });
      }

      var $pw = this.$el.find('.password'),
          pw = $pw.val();

      if (!pw) {
        this.app.controls.fieldError({
          element: $pw,
          type: 'error',
          error: 'Please enter your password'
        });
      }

      // shake the modal if any fields are missing
      if (!confirm || !pw) {
        this.refuse();
        return;
      }

      this.app.session.tokens.pass = pw;

      // retry the original method
      this.context[this.method](null, true).then(function() {
        self.context.trigger('hardConfirm');
        self.closeModal();

      // incorrect password
      }).fail(function(error) {
        self.refuse();

        if (error.responseJSON && error.responseJSON.error == 'incorrect_password') {
          // render the error message
          self.app.controls.fieldError({
            element: $pw,
            type: 'error',
            error: 'Incorrect password'
          });
        }
      });
    }

  });
});