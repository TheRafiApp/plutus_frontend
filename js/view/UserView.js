/**
 * UserView.js
 */

define([
  'app',
  'view/ModelView',
  'model/users/UserModel',
  'text!templates/users/user.html'
],
function(app, ModelView, UserModel, UserTemplate) {

  return Backbone.View.extend({

    className: 'user-view',

    events: {
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

    resendInvitation: function() {
      var self = this;

      this.model.resendInvitation().then(function() {
        app.alerts.success('Invitation has been resent to ' + self.model.get('full_name'));
      }, function(e) {
        console.warn(e);
        app.alerts.error('Could not resend invitation...');
      });
    }

    // constructData: function() {
    //   var self = this;
    //   var $form = this.$el.find('.form-model');
    //   var data_array = $form.serializeArray();
    //   var formData = {};

    //   $.map(data_array, function(x) {
    //     formData[x['name']] = x['value'];
    //   });

    // }

  });
});