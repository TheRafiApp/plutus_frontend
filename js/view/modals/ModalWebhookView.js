/**
 * ModalWebhookView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'model/admin/WebhookModel',
  'text!templates/modals/modal-webhook.html'
],
function(app, ModalView, WebhookModel, ModalTemplate) {

  return ModalView.extend({

    title: function() {
      return this.action + ' Webhook';
    },

    template: _.template(ModalTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.model = new WebhookModel();
      this.renderModalView();
    },

    render: function() {
      this.ready();

      return this;
    }

  });
});