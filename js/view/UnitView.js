/**
 * UnitView.js
 */

define([
  'app',
  'kalendae',
  'model/users/TenantModel',
  'model/properties/UnitModel',
  'view/modals/ModalLeaseView',
  'view/cards/lease',
  'text!templates/units/unit.html',
  'text!templates/headers/header-tertiary-panel-model.html',
],
function(app, Kalendae, TenantModel, UnitModel, ModalLeaseView, LeaseCardView, UnitTemplate, HeaderTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'model-view unit-view',

    events: {
      'click .action-close': 'closePanel',
      'click .action-edit': 'toggleEdit',
      'click .action-cancel': 'cancelEdit',
      'click .action-save': 'promptSave',
      'click .action-delete': 'promptDelete',
      'click .action-add-lease': 'addLease',
      'click .action-back': 'closePanel'
    },

    template: _.template(UnitTemplate),
    template_container: _.template(HeaderTemplate),

    initialize: function(options) {
      _.extend(this, options);
      var self = this;

      this.model = new UnitModel({
        _id: this._id,
      }, { 
        parentModelId: this.parentModelId
      });

      Backbone.Validation.bind(this);

      this.model.fetch().then(function() {
        self.render();
      });
    },

    attachEvents: function() {
      this.on('confirmSave', this.saveModel, this);
      this.on('confirmDelete', this.deleteModel, this);
      this.on('leaseCreated', this.initialize, this);
      this.on('leaseEdited', this.initialize, this);
      this.on('leaseRenewed', this.initialize, this);
      this.on('modalClosed', this.clearModal, this);
      this.listening = true;
    },

    render: function() {
      if (!this.listening) this.attachEvents();
      var self = this;
      var data = this.model.toJSON();

      var header_info = {
        model: this.model.get('number_pretty')
      };

      this.$el.html(this.template_container({ header: header_info }));
      this.$el.find('.scroll-y').html(this.template({ unit: data }));

      this.leases = this.model.get('leases');

      _.each(this.leases, function(lease) {

        var tenants = [];

        _.each(lease.tenants, function(tenant) {
          var tenantModel = new TenantModel(tenant);
          tenants.push(tenantModel.toJSON());
        });
        
        var lease_card = new LeaseCardView({
          data: lease,
          tenants: tenants,
          parentView: self
        });

        self.$el.find('.grid').append(lease_card.$el);
      });

      // $('.table-container .row[data-id="' + this._id + '"]').addClass('selected');

      var delay = setTimeout(function() {
        $('body').removeClass('tertiary-hidden');
        self.$el.addClass('active');
        clearTimeout(delay);
      }, 90);

      $('.quarternary').removeClass('loading');

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

    constructData: function() {
      var $form = this.$el.find('form');
      var formData = $form.serializeObject();

      return app.schema.process(formData, this.model);
    },

    saveModel: function() {
      var self = this;
      var formData = this.constructData();

      console.log(formData);

      // Save to server
      this.model.save(formData).then(function() {
        var route = app.router.getPath().split('/');
        route.pop();
        route = route.join('/');
        app.controls.hideQuarternary({
          trigger: false
        });
        app.router.navigate(route, { trigger: true });
      }, function(e) {
        console.warn(e);
      });
    },

    promptSave: function() {
      if (!app.utils.validate(this)) return false;

      var target = this.model.get('number');
      var message = 'You have made changes to ' + target + '. Are you sure you want to save your changes?';

      app.controls.modalConfirm(message, 'confirmSave', this);
    },

    promptDelete: function() {
      var target = this.model.get('number');
      var message = 'Are you sure you want to delete #' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);

      // app.controls.promptDelete(message, 'confirmDelete', this);
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

    closePanel: function() {
      app.controls.hideQuarternary({
        trigger: true
      });
    },

    addLease: function() {
      this.modal = new ModalLeaseView({
        action: 'add',
        // unit: this.model,
        // parentModelId: this.parentModelId,
        context: this,
        eventName: 'leaseCreated',
        // leases: this.leases
      });
    },

    editLease: function(view) {
      this.modal = new ModalLeaseView({
        action: 'edit',
        // unit: this.model, 
        // parentModelId: this.parentModelId,
        context: this, 
        eventName: 'leaseEdited',
        model: view.model,
        // leases: this.leases
      });
    },

    renewLease: function(view) {
      this.modal = new ModalLeaseView({
        action: 'renew',
        // unit: this.model,
        // parentModelId: this.parentModelId, 
        context: this, 
        eventName: 'leaseRenewed',
        model: view.model,
        // leases: this.leases
      });
    },

    clearModal: function() {
      delete this.modal;
    }

  }));
});