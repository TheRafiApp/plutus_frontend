/**
 * LeaseView.js
 */

define([
  'app',
  'view/cards/user',
  'view/modals/ModalLeaseView',
  'view/modals/ModalBillView',
  'model/users/TenantModel',
  'model/properties/PropertyModel',
  'model/leases/LeaseModel',
  'text!templates/leases/lease.html',
  'text!templates/repeaters/charge.html',
  'text!templates/headers/header-tertiary-model.html',
],
function(
  app, 
  UserCardView,
  ModalLeaseView, 
  ModalBillView,
  TenantModel, 
  PropertyModel, 
  LeaseModel, 
  LeaseTemplate,
  ChargeTemplate,
  HeaderTemplate
) {

  return Backbone.View.extend({

    className: 'model-view lease-view',

    events: {
      'click .action-add-bill': 'addBill',
      'click .action-edit': 'editLease',
      'click .action-save': 'promptSave',
      'click .action-delete': 'promptDelete',
      'click .action-close': 'hideTertiary'
    },

    template: _.template(LeaseTemplate),
    template_container: _.template(HeaderTemplate),

    options: {
      edit: true,
      delete: true
    },

    initialize: function(options) {
      _.extend(this, options);
      var self = this;

      this.model = new LeaseModel({ _id: this._id });

      // Backbone.Validation.bind(this);

      this.model.fetch().then(function() {
        self.render();
      });
    },

    render: function() {
      var self = this;

      this.on('leaseEdited', this.leaseEdited, this);
      this.on('confirmDelete', this.deleteModel, this);

      this.leases = this.model.get('unit.leases');
      this.property = new PropertyModel(this.model.get('property'));

      console.warn(this.model)
      
      var data = this.model.toJSON();

      var header_info = {
        model: this.model.get('lease')
      };
      
      this.$el.html(this.template_container({ 
        header: header_info,
        options: this.options
      }));
      
      this.$el.find('.scroll-y').html(this.template({ lease: data }));

      var tenants = this.model.get('tenants');

      _.each(tenants, function(tenant) {
        var tenantModel = new TenantModel(tenant);
        var tenant_card = new UserCardView({ data: tenantModel.toJSON() });
        self.$el.find('.grid').append(tenant_card.$el);
      });

      var charges = this.model.get('charges');

      if (charges.recurring && charges.recurring.length > 1) {

        charges.recurring.forEach(function(charge) {
          if (charge.type == 'rent') return false;
          var charge_template = _.template(ChargeTemplate);

          var type = app.utils.capitalize(charge.type);

          var data = {
            amount: app.utils.prettyMoney(charge.amount),
            type: type,
            description: charge.description,
            date: moment.utc(charge.date).format('MM/DD/YYYY')
          };
          
          self.$el.find('.recurring').append(charge_template({
            charge: data
          }));
        });

      } else {
        this.$el.find('.recurring').remove();
      }

      if (charges.scheduled && charges.scheduled.length > 0) {

        charges.scheduled.forEach(function(charge) {
          var charge_template = _.template(ChargeTemplate);

          var type;
          if (charge.type == 'first_month') {
            type = 'First Month';
          } else if (charge.type == 'last_month') {
            type = 'Last Month';
          } else {
            type = app.utils.capitalize(charge.type);
          }

          var data = {
            amount: app.utils.prettyMoney(charge.amount),
            type: type,
            description: charge.description,
            date: moment.utc(charge.date).format('MM/DD/YYYY')
          };

          self.$el.find('.scheduled').append(charge_template({
            charge: data
          }));
        });

      } else {
        this.$el.find('.scheduled').remove();
      }

      $('.row[data-id="' + app.views.currentView.selected + '"]').addClass('selected');
      $('.tertiary').removeClass('loading');

      return this;
    },

    // toggleEdit: function() {
    //   var $btn = this.$el.find('.action-edit');
    //   var $actions = $btn.parent().parent();
    //   var $form = this.$el.find('form.form-model');

    //   if ($form.hasClass('editing')) {
    //     $actions.removeClass('editing');
    //     $form.removeClass('editing');
    //     $form.find('input').prop('disabled', true);
    //   } else {
    //     $actions.addClass('editing');
    //     $form.addClass('editing');
    //     $form.find('input').prop('disabled', false);
    //   }
    // },

    // cancelEdit: function() {
    //   this.render();
    // },

    // promptSave: function() {
    //   if (!app.utils.validate(this)) return false;

    //   var target = 'TODO';
    //   var message = 'You have made changes to ' + target + '. Are you sure you want to save your changes?';

    //   app.controls.modalConfirm(message, 'confirmSave', this);
    // },

    promptDelete: function() {
      var target = this.model.get('lease');
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
        app.router.navigate('properties', { trigger: true });
      }, function() {
        app.router.navigate('properties', { trigger: true });
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
      app.controls.hideTertiary();
    },

    addLease: function() {
      this.modal = new ModalLeaseView({
        action: 'add',
        unit: this.model,
        property: this.property,
        context: this,
        eventName: 'leaseCreated',
        leases: this.leases
      });
    },

    editLease: function(view) {
      this.modal = new ModalLeaseView({
        action: 'edit',
        unit: this.model, 
        property: this.property,
        context: this, 
        eventName: 'leaseEdited',
        model: this.model,
        leases: this.leases
      });
    },

    renewLease: function(view) {
      this.modal = new ModalLeaseView({
        action: 'renew',
        unit: this.model,
        property: this.property,
        context: this, 
        eventName: 'leaseRenewed',
        model: this.model,
        leases: this.leases
      });
    },

    addBill: function() {
      var lease = this.model.toJSON();
      var unit_id = lease.unit._id;
      var property_id = lease.property._id;

      new ModalBillView({
        action: 'add',
        context: this,
        eventName: 'modelAdded',
        unit_id: unit_id,
        property_id: property_id
      });
    },

    leaseEdited: function() {
      this.initialize();
      app.views.currentView.initialize();
    },

    // hideTertiary: function() {
    //   if (app.views.modelView || app.views.unitsView) app.controls.hideTertiary();
    // },

  });
});