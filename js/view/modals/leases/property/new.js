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
      'change input[name="pay_into_target"]': 'updatePayInto',
      'click .action-toggle': 'toggleModelType'
    },

    template: _.template(StepTemplate),

    place_data: {},

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.model = new PropertyModel();

      this.collection = new FundingSourcesCollection();

      Backbone.Validation.bind(this);

      this.collection.fetch().then(function() {
        self.render();
        self.parentView.unlock();
      });

      this.parentView.lock();
      this.render();

      this.attachEvents();

      return this;
    },

    placeChange: function() {
      this.place_data = this.autocomplete.place;
    },

    attachEvents: function() {
      if (!this.listening) {
        this.listening = true;
        this.on('autocomplete--selection', this.placeChange, this);
      }
    },

    render: function() {
      this.$el.html(this.template({
        property: this.parentView.parentView.data.property,
        funding_sources: this.collection.toJSON()
      }));

      this.autocomplete = new AutoCompleteView({
        input: this.$el.find('.address-selector'),
        context: this,
        overflowEscape: true
      });

      this.updatePayInto();

      return this;
    },

    updatePayInto: function(e) {
      var value = this.$el.find('input[name="pay_into_target"]:checked').val();
      var $dropdown = this.$el.find('.pay-into .dropdown');
      var $select = $dropdown.children('select');
      var isTrue = value === 'true';

      var action = isTrue ? 'show' : 'hide';
      $dropdown[action]();

      $select.attr('disabled', !isTrue);
    },

    toggleModelType: function() {
      this.parentView.toggleModelType();
    },

    constructData: function() {
      if (_.isEmpty(this.place_data)) {
        app.controls.fieldError({
          element: '.address-selector',
          error: 'Please select a valid adddress'
        });

        return false;
      }

      var data = this.$el.find('form').serializeObject();
      
      if (data['pay_into_target'] === 'false') data.dwolla = { funding_source: null };

      data.address = this.place_data.address;
      data.city = this.place_data.city;
      data.state = this.place_data.state;
      data.zip = this.place_data.zip;
      data.country = this.place_data.country;
      data.place_id = this.place_data.place_id;

      delete data['pay_into_target'];

      return app.schema.process(data, this.model);
    },

    validate: function() {
      var self = this;

      var promise = app.utils.promises(1)[0];

      var data = this.constructData();
      if (!data) return promise.reject();
      
      if (this.model) {
        validate = app.utils.validate(this, data);
        if (validate) promise = this.validateOnServer(data);
      } else {
        if (validate) {
          promise.resolve();
        } else {
          promise.reject();
        }
      }

      return promise;
    },

    validateOnServer: function(data) {
      return this.model.validateOnServer(data);
    },

    next: function() {
      var self = this;

      var validate = this.validate().then(function() {
        var data = self.constructData();
        self.parentView.setData(data);
      });
    }
    
  });
});