/**
 * unit.js
 */

define([
  'app',
  'view/modals/ModalStepView',
  'view/modals/leases/tenants/new',
  'view/modals/leases/tenants/existing',
  'text!templates/modals/leases/tenants.html'
],
function(
  app, 
  ModalStepView,
  NewView, 
  ExistingView,
  StepTemplate
) {

  return ModalStepView.extend({

    template: _.template(StepTemplate),

    events: {
      'click .action-add-tenant': 'addNew'
    },

    beforeRender: function() {
      console.log('beforeRender tenants')
      this.parentView.data.tenants = {};
    },

    render: function() {
      console.log('render tenants')
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

      this.new_models.push(newView);

      this.$el.find('.new-tenants').append(newView.$el);
    },

    setData: function(data) { 
      console.log('sd tenants')
      this.parentView.data.tenants = data;
      this.success();
    },

    constructData: function() {
      console.log('cD tenants')
      var tenants = this.existing_tenants.constructData();

      this.new_models.forEach(function(new_tenant) {
        tenants.push(new_tenant.constructData());
      });

      return tenants;
    },

    validate: function() {
      var all_validate = true;

      this.new_models.forEach(function(new_tenant) {
        var validate_tenant = new_tenant.validate();
        if (!validate_tenant) all_validate = false;
      });

      if (this.new_models.length === 0) {
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

  });
});