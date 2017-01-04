/**
 * ModalAdminView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'text!templates/modals/modal-admin.html'
],
function(app, ModalView, ModalInviteTemplate) {

  return ModalView.extend({

    title: function() {
      return this.action + ' ' + this.role;
    },

    template: _.template(ModalInviteTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      // dynamically load model
      this.role = app.utils.capitalize(this.context.modelName);

      app.utils.loadModel.get('users/' + this.role + 'Model').then(function(UserModel) {
        self.model = new UserModel();
        self.renderModalView();
      });
    },

    render: function() {
      var self = this;

      this.ready();

      app.controls.renderPasswordFields(this);

      return this;
    },

    // confirm: function() {
    //   var self = this;
    //   var error = false;

    //   var pw = this.$el.find('.password');

    //   if (!Backbone.Validation.patterns.password.test(pw.val())) {
    //     app.controls.fieldError({
    //       element: pw,
    //       error: Backbone.Validation.messages.password
    //     });
    //     error = true;
    //   }

    //   var formData = this.constructData();

    //   if (!app.utils.validate(this, formData)) return false;

    //   if (error) return;
      
    //   app.controls.loadLock(true);

    //   this.model.save(formData).always(function() {
    //     app.controls.loadLock(false);
    //   }).then(function() {
    //     self.context.trigger(self.eventName);
    //     self.closeModal();
    //     app.alerts.success(self.messages.success);
    //   }).fail(function(error) {
    //     self.handleError(error);
    //   });
    // },
    
  });
});