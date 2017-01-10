/**
 * modals/leases/property/new.js
 */

define([
  'app',
  'view/components/autocomplete',
  'model/properties/PropertyModel',
  'collection/account/FundingSourcesCollection',
  'text!templates/modals/leases/property/new.html'
],
function(app, AutoCompleteView, PropertyModel, FundingSourcesCollection, StepTemplate) {

  return Backbone.View.extend({

    events: {
      'keyup .address-selector': 'handleChange',
      'change input[name="pay_into_target"]': 'updatePayInto',
      'click .action-toggle': 'toggleModelType'
    },

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.model = new PropertyModel();

      this.collection = new FundingSourcesCollection();

      this.collection.fetch().then(function() {
        self.render();
        self.context.unlock();
      });

      this.context.lock();
      this.render();

      return this;
    },

    render: function() {
      this.$el.html(this.template({
        property: this.context.property,
        funding_sources: this.collection.toJSON()
      }));

      this.autocomplete = new AutoCompleteView({
        input: this.$el.find('.address-selector'),
        context: this,
        overflowEscape: true
      });

      return this;
    },

    handleChange: function(e) {
      var query = $(e.currentTarget).val();

      if (e.which && e.which === 27) e.preventDefault(); // esc dont close modal

      this.autocomplete.search(query);
      this.autocomplete.keyControl(e);
    },

    updatePayInto: function(e) {
      var value = $(e.currentTarget).val();
      var $dropdown = this.$el.find('.pay-into .dropdown');

      var action = value === 'true' ? 'show' : 'hide';
      $dropdown[action]();

      // if (value === 'true') {
      //   $dropdown.show();
      // } else {
      //   $dropdown.hide();
      // }
    },

    toggleModelType: function() {
      this.parentView.toggleModelType();
    }
    
    
  });
});