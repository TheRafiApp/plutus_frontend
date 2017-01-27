/**
 * /components/autocomplete.js
 */

define([
  'app',
  'text!templates/components/autocomplete.html',
],
function(app, ResultsTemplate) {

  return Backbone.View.extend({

    className: 'autocomplete',

    events: {
      'click a': 'selectItem'
    }, 

    template: _.template(ResultsTemplate),
    
    initialize: function(options) {
      _.extend(this, options);

      if (this.overflowEscape) this.$el.addClass('fixed');
      return this.render();
    },

    render: function(data) {
      var self = this;

      this.$el.html(this.template({
        suggestions: data || []
      }));

      this.$el.find('.choices a').removeClass('active');
      this.$el.find('.choices li:first-child a').addClass('active');
      app.views.appView.addAutocomplete(this);

      this.initEventListeners();

      return this;
    },

    handleChange: function(e) {
      var query = $(e.currentTarget).val();
      
      this.place_data = {};

      if (e.which && e.which === 27) e.preventDefault(); // esc dont close modal

      this.search(query);
      this.keyControl(e);
    },

    initEventListeners: function() {
      if (!this.rendered) {
        var self = this;

        $(window).on('scroll', function() {
          self.hide();
        })
        .on('resize', function() {
          self.hide();
        });

        $('.scroll-container').on('scroll', function() {
          self.hide();
        });

        this.input.on('keyup', $.proxy(this.handleChange, this));

        this.input.on('blur', function() {
          setTimeout(function() {
            self.hide();
          }, 180);
        });

        this.rendered = true;
      }
      this.delegateEvents();
    },

    search: function(query) {
      // if (query === this.currentQuery) return;
      if (query === '') return this.resetQuery();

      this.currentQuery = query;

      var boundMethod = this.displaySuggestions.bind(this);

      var service = new google.maps.places.AutocompleteService();
      service.getPlacePredictions({ 
        types: ['address'],
        input: query, 
        componentRestrictions: {
          country: 'us'
        }
      }, boundMethod);
    },

    displaySuggestions: function(data) {
      var input = this.input;

      this.suggestions = data;
      this.update(data, input);
    },

    update: function(data, input) {
      this.updatePosition(input);

      this.render(data);
      this.$el.addClass('visible');
    },

    updatePosition: function(input) {
      var clientRect = input[0].getBoundingClientRect();
      var width = clientRect.right - clientRect.left;
      var top = clientRect.top + input.outerHeight() - 10;

      this.$el.css({
        top: top,
        left: clientRect.left,
        width: width
      });
    },

    keyControl: function(e) {
      var val = e.which;

      if ([38].contains(val)) {         // up
        this.selectPrev();
      } else if ([40].contains(val)) {  // down
        this.selectNext();
      } else if ([27].contains(val)) {  // escape
        this.hide();
      } else if ([13].contains(val)) {  // return
        this.selectActiveItem();
      }
    },

    selectPrev: function() {
      var $list = this.$el.find('li');
      var $current = this.$el.find('.active');
      var index = $current.parent().index();

      if (index > 0) {
        $current.removeClass('active');
        this.$el.find('li:nth-child(' + index + ') a').addClass('active');
      }
    },

    selectNext: function() {
      var $list = this.$el.find('li');
      var $current = this.$el.find('.active');
      var index = $current.parent().index();

      if (index < ($list.length -1)) {
        $current.removeClass('active');

        var newIndex = index + 2;
        this.$el.find('li:nth-child(' + newIndex + ') a').addClass('active');
      }
    },

    selectActiveItem: function() {
      var index = this.$el.find('.active').parent().index();

      this.choice = this.suggestions[index];

      this.getDetails(this.choice.place_id);

      this.$el.removeClass('visible');
      this.input.val(this.choice.description);
    },

    selectItem: function(e) {
      console.log(e);

      this.$el.find('.active').removeClass('active');
      $(e.currentTarget).parent().addClass('active');

      this.selectActiveItem();
      this.input.focus();
    },

    getDetails: function(placeId) {
      var boundMethod = this.updateDetails.bind(this);

      var $place = this.$el.find('.place-details')[0];

      var service = new google.maps.places.PlacesService($place);
      service.getDetails({ 
        placeId: placeId
      }, boundMethod);
    },

    updateDetails: function(data) {
      var fullAddress = data.formatted_address;
      var place_id = data.place_id;

      var address_components = data.address_components;
      var components = {}; 
      _.each(address_components, function(v1, k) {
        _.each(v1.types, function(v2, k2) {
          components[v2] = v1.long_name;
        });
      });

      var place_data = {
        address: data.formatted_address.split(',')[0],
        city: components.locality || components.sublocality,
        state: components.administrative_area_level_1,
        zip: components.postal_code,
        country: components.political,
        place_id: place_id
      };

      this.setPlace(place_data);
    },

    setPlace: function(place_data) {
      this.place = place_data;
      this.emitChange();
    },

    resetQuery: function() {
      this.hide();
      delete this.choice;
    },

    emitChange: function(place_data) {
      this.context.trigger('autocomplete--selection');
    },

    hide: function() {
      this.$el.removeClass('visible');
    }
    
  });
});