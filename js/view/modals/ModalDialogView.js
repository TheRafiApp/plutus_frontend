/**
 * ModalDialogView.js
 */

define([
  'backbone',
  'text!templates/modals/modal-dialog.html'
],
function(
  Backbone, 
  ModalDialogTemplate
){

  return Backbone.View.extend({

    'events': {
      'keyup': 'keyControl',
      'click .action-confirm': 'confirm',
      'click .action-cancel': 'closeModal',
      'click .overlay': 'closeModal',
    },

    keyControl: function(e) {
      e.preventDefault();
      // esc
      if (e.which === 27) {
        this.closeModal();
      // enter
      } else if (e.which === 13) {
        if (this.app.utils.getFocused().parentNode.className.contains('actions')) return;
        this.confirm();
      }
    },

    actions: {
      cancel: true,
      confirm: true,
    },

    template: _.template(ModalDialogTemplate),
    
    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.options = _.extend(this.actions, this.options);

      // this modal is now used in activation, before AppView is rendered
      this.app.views.appView && this.app.views.appView.trigger('modalOpened');
      this.app.views.modalView = this;
    },

    render: function() {
      var self = this;

      if (!this.eventName) this.eventName = 'confirm';

      this.$el.html(this.template({
        options: this.options || {},
        dialog: this.model
      }));
      $('.modal-container').html(this.$el).addClass('visible');
      this.$el.find('.action-confirm').focus();

      return this;
    },

    closeModal: function() {
      $('.modal-container').removeClass('visible');
      this.app.views.appView && this.app.views.appView.trigger('modalClosed');
      this.close();
    },

    confirm: function() {
      console.log(this.context);
      if (this.eventName) this.context.trigger(this.eventName);
      this.closeModal();
    }

  });
});