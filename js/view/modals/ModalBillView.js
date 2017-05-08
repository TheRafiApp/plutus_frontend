/**
 * ModalBillView.js
 */

define([
  'app',
  'kalendae',
  'view/modals/ModalView',
  'model/bills/BillModel',
  'model/leases/LeaseModel',
  'collection/users/TenantsCollection',
  'collection/leases/LeasesCollection',
  'view/repeaters/charge',
  'view/properties/PropertyUnitsView',
  'text!templates/users/tenants.html',
  'text!templates/leases/leases.html',
  'text!templates/modals/modal-bill.html'
],
function(
  app,
  kalendae,
  ModalView,
  BillModel,
  LeaseModel,
  TenantsCollection,
  LeasesCollection,
  ChargeRepeater,
  PropertyUnitsView,
  TenantsTemplate,
  LeasesTemplate,
  ModalBillTemplate
) {

  return ModalView.extend({

    'events': {
      'click .choices a': 'chooseOption',
      'click .tabs a': 'showTab',
      'click .action-select-lease': 'selectLease',
      'click .action-add-charge': 'addCharge',
      'click .action-delete': 'closeCharge'
    },

    charges: [],

    template: _.template(ModalBillTemplate),

    tabs: {
      address: 'By Address',
      tenant: 'By Tenant'
    },

    title: function() {
      return this.action + ' Bill';
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.model = new BillModel();

      this.on('addressChanged', this.updateAddress, this);

      var promises = app.utils.promises(2);

      this.tenants = new TenantsCollection(null, {
        action: 'active'
      });

      this.tenants.fetch().then(function() {
        promises[0].resolve();
      });

      this.leases = new LeasesCollection();
      this.leases.fetch().then(function() {
        promises[1].resolve();
      });

      $.when.apply($, promises).then(function() {
        self.renderModalView();
      });
    },

    renderError: function(error) {
      this.$el.find('.content')
      .addClass('error')
      .append($('<div />', {
        class: 'error overlay'
      }).html($('<span />')
        .text(error)
      ));

      this.$el.find('.action-confirm').addClass('disabled');
    },

    render: function() {
      var self = this;

      this.ready();

      this.PropertyUnitsView = new PropertyUnitsView({
        selected_property: this.property_id,
        selected_unit: this.unit_id,
        activeOnly: true,
        context: this
      });

      this.$el.find('.tab-address .property-units').html(this.PropertyUnitsView.$el);

      var tenants = this.tenants.toJSON();

      tenants = tenants.map(function(tenant) {
        return [tenant.first_name + ' ' + tenant.last_name, tenant._id];
      });

      this.$el.find('.tenant-search').autoComplete({
        minChars: 2,
        source: function(term, suggest) {
          term = term.toLowerCase();
          var choices = tenants;
          var matches = [];

          for (i=0; i<choices.length; i++)
            if (~choices[i][0].toLowerCase().indexOf(term)) matches.push(choices[i]);

          suggest(matches);
        },
        renderItem: function(item, search) {
          return '<div class="autocomplete-suggestion" data-val="' + item[0] + '" data-id="' + item[1] + '">' + item[0] + '</div>';
        },
        onSelect: function(e, term, item) {
          var tenant_id = $(item).attr('data-id');
          self.renderTenantData(tenant_id);
        }
      });

      var $date_field = this.$el.find('#due_date');

      // Init Kalendae

      this.due_date = new Kalendae($date_field[0], {
        months: 1,
        direction: 'today-future',
        selected: moment()
      });

      this.due_date.subscribe('change', function(date) {
        self.populateDate(date);
      });

      this.populateDate();
      this.addCharge();

      return this;
    },

    chooseOption: function(e) {
      this.$el.find('.choices a').removeClass('active');
      $(e.currentTarget).addClass('active');
    },

    updateAddress: function() {
      var propUnitsView = this.PropertyUnitsView;

      // check if properties exist
      var properties = propUnitsView.properties;
      if (properties.length === 0) {
        this.showError('.properties-group', 'No properties with units found.');
        return;
      }

      // check if units exist
      var units = propUnitsView.units;
      if (units.length === 0) {
        this.showError('.units-group', 'No units with active leases found.');
        return;
      }

      // get selected unit id
      var unit_id = propUnitsView.$el.find('.units').val();

      // get the model with that id
      var unit = units.where({ _id: unit_id });

      // get the units leases
      var leases = new LeasesCollection(unit[0].get('leases'));

      // make sure the leases are active
      var active = leases.filter(function(lease) {
        return lease.active ? true : false;
      });

      this.$el.find('.tab-address input.lease').val('');

      if (active.length > 0) {
        this.selected_lease = active[0];
        this.$el.find('.tab-address input.lease').val(active[0].id);
        this.renderTenants('.tab-address .tenants-select', active[0].get('tenants'));
      } else {
        // if unit has leases but none are active, this probably wont happen anymore
        this.showError('.tenants-group', 'Sorry, no active leases found.');
      }
    },

    renderTenants: function(selector, tenants_array) {
      var tenants_template = _.template(TenantsTemplate);
      this.$el.find(selector).html(tenants_template({
        tenants: tenants_array,
        selected: false
      }));
      this.$el.find('.chosen.tenants').chosen({
        width: '100%'
      });
    },

    renderTenantData: function(tenant_id) {
      this.tenant_leases = this.findTenant(tenant_id);

      var leases_template = _.template(LeasesTemplate);

      this.$el.find('.tenants-select').html('');

      this.$el.find('.leases').html(leases_template({
        leases: this.tenant_leases
      }));
    },

    findTenant: function(tenant_id) {
      var leases = this.leases.toJSON();
      var tenant_leases = leases.filter(function(lease) {
        var match = lease.tenants.find(function(tenant) {
          return tenant._id === tenant_id;
        });
        return match ? true : false;
      });

      return tenant_leases;
    },

    selectLease: function(e) {
      var lease_id = $(e.currentTarget).attr('data-id');

      this.$el.find('.tab-tenant input.lease').val(lease_id);

      this.selected_lease = this.tenant_leases.find(function(lease) {
        return lease._id === lease_id;
      });

      this.renderTenants('.tab-tenant .tenants-select', this.selected_lease.tenants);
    },

    showError: function(selector, message) {
      this.$el.find(selector).addClass('has-error').children('.help-text').html(message);
    },

    showTab: function(e, tab) {
      var clicked = $(e.currentTarget);
      if (clicked.hasClass('active')) return;

      this.$el.find('.tabs a').removeClass('active');
      clicked.addClass('active');

      var tabName = tab || $(e.currentTarget).attr('data-tab');
      this.$el.find('.tab-content').hide();
      this.$el.find('.tab-content select, .tab-content input').prop('disabled', true);

      this.$el.find('.tab-content.tab-' + tabName).show();
      this.$el.find('.tab-content.tab-' + tabName + ' select, .tab-content.tab-' + tabName + ' input').prop('disabled', false);
    },

    populateDate: function(date) {
      if (!date) date = this.due_date.getSelectedRaw()[0].format('MM/DD/YYYY');
      this.$el.find('.date-input').val(date);
      this.$el.find('.date-input').trigger('change');
    },

    constructData: function() {
      var $form = this.$el.find('form');

      var formData = $form.serializeObject();

      // we dont't want unit, but propertUnitsView needs it for lease creation
      delete formData.unit;

      // make sure due date is within lease term
      var due_date = moment.utc(formData.due_date);

      var selected_lease_model = new LeaseModel(this.selected_lease)

      if (!selected_lease_model.containsDate(due_date)) {
        app.controls.fieldError({
          element: '.date-input',
          error: 'Due date is outside term of lease'
        });
      } else {
        // modals wont save if errors are present
        this.$el.find('.field-group').removeClass('has-error');
        this.$el.find('.help-text').text('');
      }

      return app.schema.process(formData, this.model);
    },

    chargeCounter: 0,

    addCharge: function() {
      var recurring_charge = new ChargeRepeater({
        options: {
          type: 'fee',
          description: true
        },
        name: 'charges.scheduled',
        id: this.chargeCounter++,
        context: this,
        min: 1
      });

      this.charges.push(recurring_charge);
      this.$el.find('.charges').append(recurring_charge.$el);
    }

  });
});
