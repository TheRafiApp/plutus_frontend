/**
 * CompanyView.js
 */

define([
  'app',
  'model/companies/CompanyModel',
  'text!templates/companies/company.html',
  'text!templates/headers/header-tertiary-model.html',
],
function(app, CompanyModel, CompanyTemplate, HeaderTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'company-view',

    events: {
      'click .action-edit': 'toggleEdit',
      'click .action-cancel': 'toggleEdit',
      'click .action-save': 'promptSave',
      'click .action-delete': 'promptDelete',
      'click .action-close': 'hideTertiary'
    },

    options: {
      edit: true,
      delete: true
    },

    initialize: function(options) {
      _.extend(this, options);
      var self = this;
      this.template = _.template(CompanyTemplate);
      this.template_container = _.template(HeaderTemplate);
      //this.model.on('change', this.render, this);

      this.model = new CompanyModel({ _id: this._id });

      this.model.fetch().then(function() {
        self.render();
      });
      this.on('confirmSave', this.saveModel, this);
      this.on('confirmDelete', this.deleteModel, this);
    },

    render: function() {
      var data = this.model.toJSON();

      var header_info = {
        model: this.model.get('name')
      };

      this.$el.html(this.template_container({ 
        header: header_info,
        options: this.options
      }));

      this.$el.find('.scroll-y').html(this.template({ company: data }));

      console.log($('.tertiary'))

      $('.row[data-id="' + app.views.currentView.selected + '"]').addClass('selected');

      $('.tertiary').removeClass('loading');

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

    promptSave: function() {
      var target = this.model.get('name');
      var message = 'You have made changes to ' + target + '. Are you sure you want to save your changes?';

      app.controls.modalConfirm(message, 'confirmSave', this);
    },

    promptDelete: function() {
      var target = this.model.get('name');
      var message = 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    },

    saveModel: function() {
      var self = this;
      var $form = $('.form-model');
      var data_array = $form.serializeArray();
      var formData = {};

      $.map(data_array, function(x){
        formData[x['name']] = x['value'];
      });

      // Save to server
      this.model.save(formData).then(function() {
        //self.hideTertiary();
        app.router.navigate('companies', { trigger: true });
      }).fail(function(error) {
        app.router.navigate('companies', { trigger: true });
        app.alerts.success('No changes were made.');
      });
    },

    deleteModel: function(event, override) {
      var self = this;
      var promise = $.Deferred();

      this.model.destroy().then(function() {
        var route = app.router.getRoute();
        app.router.navigate(route, { trigger: true });
        return promise.resolve();

      }).fail(function(error) {
        if (!override) app.controls.handleError(error, null, self, 'deleteModel');
        return promise.reject(error);
      });

      return promise;
    },

    hideTertiary: function() {
      if (app.views.modelView) app.controls.hideTertiary();
    }

  }));
});