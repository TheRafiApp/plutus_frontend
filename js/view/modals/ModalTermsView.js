/**
 * ModalTermsView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'text!templates/modals/modal-terms.html'
],
function(app, ModalView, ModalTermsTemplate) {

  return ModalView.extend({

    title: function() {
      return 'Terms of Use';
    },

    template: _.template(ModalTermsTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.renderModalView();
    },

    render: function() {
      this.ready();

      return this;
    },

    cancel: function() {
      this.closeModal();
      this.context.trigger('declineTerms');
    },

    // confirm: function() {
    //   var self = this;

    //   this.closeModal();
    // }

  });
});