/**
 * unit.js
 */

define([
  'app',
  'view/modals/leases/tenants/new',
  'view/modals/leases/tenants/existing',
  'text!templates/modals/leases/tenants.html'
],
function(
  app, 
  NewView, 
  ExistingView,
  StepTemplate
) {

  return Backbone.View.extend({

    className: 'step',

    template: _.template(StepTemplate),

    events: {
      'click .action-add-tenant': 'addNew'
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.parentView.data.tenants = {};

      this.new_tenants = [];

      this.attachEvents();

      return this.render();
    },

    attachEvents: function() {
      if (!this.listening) {
        this.listening = true;
        this.on('next', this.next, this);
      }
    },

    show: function() {
      this.$el.addClass('active');

      if (!this.fetched) { 
        this.initialize(); 
        this.fetched = true;
      }
    },

    render: function() {
      this.existing_tenants = new ExistingView({
        parentView: this
      });

      this.$el.html(this.template());
      this.$el.find('.existing-tenants').html(this.existing_tenants.$el);

      return this;
    },

    addNew: function() {
      var $fieldError = this.$el.find('.existing-tenants .has-error');
      $fieldError.removeClass('has-error');
      $fieldError.closest('.help-text').text('');

      var newView = new NewView({
        parentView: this
      });

      this.new_tenants.push(newView);

      this.$el.find('.new-tenants').append(newView.$el);
    },

    // this is confirmation of next step 
    setData: function(data) {

      this.parentView.data.tenants = data;

      this.successAnimation();
    },

    successAnimation: function() {
      $('.modal').addClass('loading success');

      var self = this;

      app.controls.wait(1200).then(function() {
        $('.modal').removeClass('loading success');
        self.parentView.nextStep();
      });
    },

    constructData: function() {
      var tenants = this.existing_tenants.constructData();

      this.new_tenants.forEach(function(new_tenant) {
        tenants.push(new_tenant.constructData());
      });

      return tenants;
    },

    next: function() {
      var validate = this.validateAll();

      if (!validate) return;
      var tenants = this.constructData();

      this.setData(tenants);
    },

    validateAll: function() {
      var all_validate = true;

      this.new_tenants.forEach(function(new_tenant) {
        var validate_tenant = new_tenant.validate();
        if (!validate_tenant) all_validate = false;
      });

      if (this.new_tenants.length === 0) {
        var existing_tenants = this.$el.find('.tenants').val();
        if (!existing_tenants) {
          all_validate = false;

          app.controls.fieldError({
            element: '.chosen-multiple',
            error: 'You must select at least one tenant'
          });
        }
      }

      return all_validate;
    },

    lock: function() {
      this.parentView.lock();
    },

    unlock: function() {
      this.parentView.unlock();
    }

  });
});