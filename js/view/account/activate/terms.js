/**
 * account/activate/terms.js
 */

define([
  'app',
  'view/modals/ModalTermsView',
  'text!templates/account/activate/terms.html',
],
function(app, ModalTermsView, Template) {

  return Backbone.View.extend({

    className: 'terms',
    template: _.template(Template),

    events: {
      'click .action-terms': 'termsModal',
      'click .action-next': 'nextStep'
    },

    initialize: function(options) {
      if (options) _.extend(this, options);
      this.render();
    },

    render: function() {
      var self = this;

      var user = this.parentView.user;

      this.$el.html(this.template({
        logo: app.templates.logo(),
        name: user.get('first_name'),
        terms_accepted: user.get('terms_accepted')
      }));

      return this;
    },

    nextStep: function() {
      var self = this;

      var $agreement = this.$el.find('#agree');
      var terms_accepted = $agreement.is(':checked');
      if (!terms_accepted) {

        app.controls.fieldError({
          element: $agreement,
          error: 'Please agree to the terms of use'
        });
        return;
      }

      var path = app.session.get('logged_in') ? 'terms' : 'activate/terms';

      app.utils.request({
        path: 'users/' + path,
        method: 'POST'
      }).then(function() {
        self.parentView.next();
      });
    },

    termsModal: function() {
      this.modal = new ModalTermsView({
        action: 'agree',
        // model: this.model,
        eventName: 'termsAgreed',
        context: this
      });
    }

  });
});