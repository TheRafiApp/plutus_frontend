/**
 * account/Profile.js
 */

define([
  'app',
  // 'model/session/AccountModel',
  'view/modals/ModalPasswordView',
  'view/modals/ModalConfirmView',
  'text!templates/account/account-profile.html'
],
function(app, ModalPasswordView, ModalConfirmView, AccountProfileTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'account account-general',

    events: {
      'click .action-edit': 'toggleEdit',
      'click .action-cancel': 'cancelEdit',
      'click .action-save': 'promptSave',
      'click .action-delete': 'promptDelete',
      'click .action-change-pw': 'promptPassword'
    },

    template: _.template(AccountProfileTemplate),

    initialize: function(options) {
      if (options) _.extend(this, options);

      var self = this;

      this.model = this.parentModel;

      Backbone.Validation.bind(this);

      this.on('changePassword', this.changePassword, this);
      this.on('confirmSave', this.saveUser, this);
      this.on('confirmDelete', this.deleteUser, this);
      
      this.model.fetch().then(function() {
        self.render();
      });

    },

    render: function() {
      var data = this.model.toJSON();

      this.$el.html(this.template({ 
        user: data
      }));

      this.delegateEvents();
      return this;
    },

    toggleEdit: function() {
      var $btn = this.$el.find('.action-edit');
      var $actions = $btn.parent().parent();
      var $form = this.$el.find('form.form-model');

      if ($form.hasClass('editing')) {
        $actions.removeClass('editing');
        $form.removeClass('editing');
        $form.find('input').prop('disabled', true);
      } else {
        $actions.addClass('editing');
        $form.addClass('editing');
        $form.find('input').prop('disabled', false);
      }
    },

    cancelEdit: function() {
      this.render();
    },

    promptSave: function() {
      console.log('promptSave')
      console.log(app.utils.validate(this));
      if (!app.utils.validate(this)) return false;

      var user = this.model.get('full_name');
      // var message = 'You have made changes to ' + user + '. Are you sure you want to save your changes?';
      var message = 'You have made changes to your profile. Are you sure you want to save your changes?';

      app.controls.modalConfirm(message, 'confirmSave', this);
    },

    promptDelete: function() {

      var user = this.model.get('first_name');
      var message = user + ', are you sure you want to delete your account?';

      app.controls.modalHardConfirm(message, 'accountDeleted', this);
    },

    saveUser: function() {
      if (!app.utils.validate(this)) return false;

      var self = this;
      var $form = $('.form-model');
      var data_array = $form.serializeArray();
      var userData = {};

      $.map(data_array, function(x){
        userData[x['name']] = x['value'];
      });

      // Save to server
      this.model.save(userData).then(function() {
        self.render();
      }, function() {
        self.render();
        app.alerts.success('No changes were made.');
      });
    },

    deleteUser: function() {
      this.model.destroy({
        success: function() {
          app.router.navigate('users', { trigger: true, replace: true });
        },
        error: function() {
          console.warn(arguments);
        }
      });
    },

    promptPassword: function() {
      this.modal = new ModalPasswordView({
        eventName: 'changePassword',
        context: this
      });
    },

    changePassword: function() {
      app.views.currentView.initialize();
    }
  }));
});