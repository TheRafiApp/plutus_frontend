/**
 * ModelView.js
 */

define([
  'app',
  'text!templates/headers/header-tertiary-model.html',
],
function(app, HeaderTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'model-view',

    events: {
      'click .action-edit': 'toggleEdit',
      'click .action-cancel': 'cancelEdit',
      'click .action-save': 'promptSave',
      'click .action-delete': 'promptDelete',
      'click .action-back': 'hideTertiary',
      'click .action-close': 'hideTertiary'
    },

    template_container: _.template(HeaderTemplate),

    initialize: function(options) {
      _.extend(this, options);
      var self = this;
      var role = app.router.getRoute();

      this.template = this.context.template;

      var Model = this.model;
      this.model = this.context.model;
      this.render();

      Backbone.Validation.bind(this);
    },

    render: function() {
      this.on('confirmSave', this.saveModel, this);
      this.on('confirmDelete', this.deleteModel, this);

      var data = this.model.toJSON();

      var header_info = {
        model: this.model.display_name()
      };

      this.$el.html(this.template_container({ 
        header: header_info,
        options: this.options
      }));

      this.$el.find('.scroll-y').html(this.template({ model: data }));

      this.$el.find('input[name="phone_pretty"]').mask('(000) 000-0000');

      $('.row[data-id="' + app.views.currentView.selected + '"]').addClass('selected');
      $('.tertiary').removeClass('loading');

      return this;
    },

    toggleEdit: function() {
      if (!this.options.edit) return;

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
      if (!this.options.edit) return;
      
      this.render();
    },

    promptSave: function() {
      if (!app.utils.validate(this)) return false;

      var target = this.model.display_name();
      var message = 'You have made changes to ' + target + '. Are you sure you want to save your changes?';

      app.controls.modalConfirm(message, 'confirmSave', this);
    },

    promptDelete: function() {
      var target = this.model.display_name();
      var message = 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    },

    saveModel: function() {
      var self = this;
      var $form = $('.form-model');
      var data_array = $form.serializeArray();
      var formData = {};

      $.map(data_array, function(x) {
        formData[x['name']] = x['value'];
      });

      // Save to server
      this.model.save(formData).success(function() {
        var route = app.router.getRoute();
        app.router.navigate(route, { trigger: true });
      }).error(function() {
        app.router.navigate(route, { trigger: true });
        app.alerts.success('No changes were made.');
      });
    },

    deleteModel: function(event, override) {
      var self = this;
      var promise = $.Deferred();

      this.model.destroy().then(function() {
        var route = app.router.getRoute();
        app.router.navigate(route, { trigger: true });

        promise.resolve();

      }).fail(function(error) {
        if (!override) app.controls.handleError(error, null, self, 'deleteModel');
        promise.reject(error);
      });

      return promise;
    },

    hideTertiary: function() {
      if (app.views.modelView) app.controls.hideTertiary();
    },

  }));
});