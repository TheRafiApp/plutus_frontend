/**
 * property.js
 */

define([
  'app',
  'view/components/autocomplete',
  'text!templates/modals/leases/property.html'
],
function(app, AutoCompleteView, StepTemplate) {

  return Backbone.View.extend({

    className: 'step',

    events: {
      'keyup .address-selector': 'handleChange'
    },

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.render();
    },

    render: function() {
      this.$el.html(this.template({
        property: this.context.property
      }));

      this.autocomplete = new AutoCompleteView({
        overflowEscape: true
      });

      return this;
    },

    handleChange: function(e) {
      var query = $(e.currentTarget).val();
      this.search(query);

      this.autocomplete.keyControl(e);
    },

    search: function(query) {
      var options = {
        types: ['address'],
        componentRestrictions: {
          country: 'usa'
        }
      };

      var test = this.displaySuggestions.bind(this);

      var service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({ 
        input: query, 
        componentRestrictions: {
          country: 'us'
        }
      }, test);
    },

    displaySuggestions: function(data) {
      var input = this.$el.find('.address-selector');
      this.autocomplete.update(data, input);
    }

  });
});