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
      this.parentView.data.tenants = {};
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

      this.new_models.push(newView);

      this.$el.find('.new-tenants').append(newView.$el);
    },

    setData: function(data) { 
      this.parentView.data.tenants = data;
      this.success();
    },

    constructData: function() {
      var tenants = this.existing_tenants.constructData();

      this.new_models.forEach(function(new_tenant) {
        tenants.push(new_tenant.constructData());
      });

      return tenants;
    },

    validate: function() {
      var promise = app.utils.promises(1)[0];
      var promises = app.utils.promises(this.new_models.length);

      this.new_models.forEach(function(new_tenant, index, array) {
        var validate_tenant = new_tenant.next().then(function() {
          promises[index].resolve();
        }).fail(function() {
          promises[index].reject();
        });
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

      $.when.apply($, promises).then(function() {
        promise.resolve();
      }).fail(function() {
        promise.reject();
      });

      return promise;
    },

  });
});