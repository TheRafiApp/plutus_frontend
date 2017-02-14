/**
 * UserView.js
 */

define([
  'app',
  'view/ModelView',
  'model/users/UserModel',
  'view/modals/ModalAuthEventsView',
  'text!templates/users/user.html'
],
function(app, ModelView, UserModel, ModalAuthEventsView, UserTemplate) {

  return Backbone.View.extend({

    className: 'user-view',

    events: {
      'click .action-view-auth-events': 'viewAuthEvents',
      'click .action-reinvite': 'resendInvitation'
    },

    template: _.template(UserTemplate),

    initialize: function(options) {
      _.extend(this, options);
      var self = this;
      var role = app.router.getRoute(); 

      this.model = new UserModel({ _id: this._id }, { role: role });

      this.model.fetch().then(function() {
        self.render();
      });
    },

    render: function() {

      this.ModelView = new ModelView({
        context: this,

        options: {
          edit: true,
          delete: true  
        }
      });

      this.$el.html(this.ModelView.$el);

      return this;
    },

    viewAuthEvents: function() {

      this.modal = new ModalAuthEventsView({
        _id: this._id,
        collection: this.collection,
        context: this, 
        actions: {
          cancel: false,
          confirm: true
        }
      });
    },

    resendInvitation: function() {
      var self = this;

      this.model.resendInvitation().then(function() {
        app.alerts.success('Invitation has been resent to ' + self.model.get('full_name'));
      }).fail(function(e) {
        app.controls.handleError(e);
      });
    }

    

  });
});