/**
 * ModalPropertyView.js
 */

define([
  'app',
  'async!https://maps.googleapis.com/maps/api/js?key=AIzaSyAK_nfRIH9in6hPb1UxtyDL6FMCHANm6n4&libraries=places&callback=initMap',
  'view/modals/ModalView',
  'model/properties/PropertyModel',
  'collection/account/FundingSourcesCollection',
  // 'collection/users/LandlordsCollection',
  // 'text!templates/landlords/select.html',
  'text!templates/modals/modal-property.html'
],
function(
  app, 
  GoogleMapsPlaces, 
  ModalView,
  PropertyModel, 
  FundingSourcesCollection,
  // LandlordsCollection, 
  // LandlordsSelectTemplate, 
  ModalPropertyTemplate
) {

  return ModalView.extend({

    // className: 'modal property',

    'events': {
      'click .action-confirm': 'confirm',
      'change input[name="pay_into_target"]': 'updatePayInto',
      'change .companies': 'companiesChange'
    },

    messages: {
      success: 'The property has been saved',
      error: 'The property could not be saved'
    },

    template: _.template(ModalPropertyTemplate),

    title: function() {
      return this.action + ' Property';
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;
      if (!this.model) this.model = new PropertyModel();
      
      // this.collection = new LandlordsCollection();
      this.collection = new FundingSourcesCollection();

      app.controls.smartRender(self, {
        admin: [ this.collection ]
      }).then(function() {
        self.renderModalView();
      });
      
    },

    render: function() {
      var self = this;

      if (!this.eventName) this.eventName = 'confirm';

      var property = this.model.toJSON();

      var companies;
      if (app.collections.companies) companies = app.collections.companies.toJSON();

      var funding_sources = this.collection.toJSON();

      this.ready({
        user: app.session.user.toJSON(),
        property: property,
        companies: companies,
        funding_sources: funding_sources
      });

      if (property) {
        this.setAddress(property);
      }

      if (app.session.isSuperAdmin()) {
        this.companiesChange();
      } else {
        // this.renderPayInto();
        // var selected = this.model.get('landlord._id');

        // this.$el.find('.landlords').html(this.landlords_template({
        //   selected: selected,
        //   landlords: this.collection.toJSON()
        // }));
      }

      this.initMap();

      return this;
    },

    updatePayInto: function(e) {
      var value = $(e.currentTarget).val();

      if (value === 'true') {
        this.$el.find('.pay-into .dropdown').show();
      } else {
        this.$el.find('.pay-into .dropdown').hide();
      }
    },

    // renderPayInto: function() {
    //   if (this.model.get('funding_source')) {
    //     this.$el.find('.specific').prop('checked', true);
    //   }
    // },

    setAddress: function(property) {
      var self = this;
      
      var fields = [
        'address',
        'city',
        'state',
        'zip',
        'country'
      ];

      fields.forEach(function(field) {
        self[field] = property[field];
      });
    },

    initMap: function() {

      var self = this;

      var map = new google.maps.Map(this.$el.find('.map')[0], {
        center: { lat: 42.369117, lng: -71.062658 },
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
        zoom: 13
      });

      var styles = [{"featureType":"water","elementType":"geometry","stylers":[{"color":"#70bdf0"},{"saturation":"-22"}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#f7f7f7"},{"lightness":20}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#dedede"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#dedede"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#dedede"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#ffffff"},{"lightness":16}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#f1f1f1"},{"lightness":21}]},{"elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#ffffff"},{"lightness":16}]},{"elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#333333"},{"lightness":40}]},{"elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#f2f2f2"},{"lightness":19}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#fefefe"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#fefefe"},{"lightness":17},{"weight":1.2}]}];
      map.setOptions({ styles: styles });

      var geocoder = new google.maps.Geocoder();
      var input = this.$el.find('.address-selector')[0];

      var options = {
        types: ['address'],
        componentRestrictions: {
          country: 'usa'
        }
      };

      var autocomplete = new google.maps.places.Autocomplete(input, options);
      autocomplete.bindTo('bounds', map);

      var infowindow = new google.maps.InfoWindow();
      var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
      });

      function setPlace() {
        infowindow.close();
        marker.setVisible(false);
          
        var place = autocomplete.getPlace();

        var address_components = place.address_components;
        var components = {}; 
        $.each(address_components, function(k,v1) {
          $.each(v1.types, function(k2, v2) {
            components[v2] = v1.long_name;
          });
        });

        if (!place.geometry) {
          
          // This requires a delay to avoid the race condition on a change event
          app.controls.wait(200).then(function() {
            app.controls.fieldError({
              element: '.address-selector',
              error: 'Please select an address from the autocomplete menu' 
            });
          });

          return;
        }

        self.address = place.name;
        self.city = components.locality || components.sublocality;
        self.state = components.administrative_area_level_1;
        self.zip = components.postal_code;
        self.country = components.political;
        self.place_id = place.place_id;

        // If the place has a geometry, then present it on a map.
        setMarker(place);
        
      }

      function setMarker(place) {
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);  // Why 17? Because it looks good.
        }
        marker.setIcon(/** @type {google.maps.Icon} */({
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
          address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ');
        }

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, marker);
      }

      function geocodePlaceId(place_id, geocoder, map, infowindow) {
        geocoder.geocode({'placeId': place_id}, function(results, status) {
          if (status === google.maps.GeocoderStatus.OK) {
            if (results[0]) {
              map.setZoom(11);
              map.setCenter(results[0].geometry.location);
              var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
              });
              infowindow.setContent(results[0].formatted_address);
              infowindow.open(map, marker);
            } else {
              window.alert('No results found');
            }
          } else {
            window.alert('Geocoder failed due to: ' + status);
          }
        });
      }

      // Run this shit

      autocomplete.addListener('place_changed', setPlace);

      var place_id = this.model.get('place_id');
      if (place_id) geocodePlaceId(place_id, geocoder, map, infowindow);
    },

    companiesChange: function() {
      // var company_id = this.$el.find('.companies').val();
      // var landlords = this.collection.where({ company_id: company_id });

      // var selected = this.model.get('landlord._id');

      // this.$el.find('.landlords').html(this.landlords_template({
      //   landlords: JSON.parse(JSON.stringify(landlords)),
      //   selected: selected
      // }));
    },

    constructData: function() {
      var $form = this.$el.find('form');

      var formData = $form.serializeObject();

      formData.address = this.address;
      formData.city = this.city;
      formData.state = this.state;
      formData.zip = this.zip;
      formData.country = this.country;
      formData.place_id = this.place_id;

      if (this.$el.find('#default').is(':checked'))
        formData.dwolla.funding_source = null;

      delete formData.pay_into_target;

      return formData;
    },

    // confirm: function() {
    //   var self = this;

    //   var formData = this.constructData();

    //   if (!app.utils.validate(this, formData)) return false;

    //   this.model.save(formData).then(function() {
    //     self.context.trigger(self.eventName);
    //     self.closeModal();
    //   }, function() {
    //     console.warn(arguments);
    //   });
    // }

  });
});