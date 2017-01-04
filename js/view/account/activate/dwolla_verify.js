/**
 * account/onboarding/dwolla_verify.js
 */

define([
  'app',
  'model/account/DwollaAccountModel',
  'model/companies/DwollaBusinessModel',
  'text!templates/account/activate/dwolla_verify.html',
  'view/modals/ModalTermsView'
],
function(app, DwollaAccountModel, DwollaBusinessModel, OnboardingTemplate, ModalTermsView) {

  return Backbone.View.extend({

    className: 'dwolla wide',
    template: _.template(OnboardingTemplate),

    events: {
      'blur .zip': 'zipChange',
      'keyup .zip': 'keyupZip',
      'click .action-next': 'confirm',
      'change #agree': 'agree'
    },

    initialize: function(options) {
      if (options) _.extend(this, options);

      this.dwolla_data = this.parentView.dwolla_data;
      this.user = this.parentView.user;

      this.on('declineTerms', this.decline, this);

      var type = this.dwolla_data.type;

      if (type === 'personal') {
        this.model = new DwollaAccountModel();
      } else if (type === 'business') {
        this.model = new DwollaBusinessModel();
      }
      
      Backbone.Validation.bind(this);

      this.render();
    },

    render: function() {
      var self = this;

      this.$el.html(this.template({
        type: this.dwolla_data.type,
        user: this.user.toJSON(),
        logo: app.templates.logo()
      }));

      app.utils.prepInputs(this);

      this.$el.find('input[name="ein"]').mask('00-0000000');

      return this;
    },

    keyupZip: function(e) {
      // esc
      if (e.which === 13) {
        this.zipChange(e);
      }
    },

    zipChange: function(e) {
      var value = e.currentTarget.value;
      if (value.length !== 5) {
        app.controls.fieldError({
          element: e.currentTarget,
          error: 'Please enter a valid zip code'
        });
      } else {
        this.getAddressData(value);
      }
    },

    getAddressData: function(zip) {
      var self = this;

      var request = app.utils.request({
        path: 'https://api.zippopotam.us/us/' + zip,
        method: 'GET',
        noheaders: true
      });

      request.then(function(response) {
        self.updateAddress(response.places[0]);
      });

    },

    updateAddress: function(address) {
      var $inputs = this.$el.find('.city, .state');
      var data = [
        address['place name'],
        address['state abbreviation']
      ];

      $.each($inputs, function(i, $input) {
        $($input).prop('disabled', false).val(data[i]);
      });
    },

    constructData: function() {
      var $form = this.$el.find('form');
      var formData = $form.serializeObject();

      return formData;
    },

    // agree: function(e) {
    //   if (this.agreed) return;

    //   this.agreed = true;

    //   this.modal = new ModalTermsView({
    //     action: 'agree',
    //     // model: this.model,
    //     eventName: 'termsAgreed',
    //     context: this
    //   });

    // },


    // decline: function() {
    //   this.$el.find('#agree').prop('checked', false);

    //   var self = this;
    //   setTimeout(function() {
    //     self.$el.find('#agree').prop('checked', false);
    //   }, 20);
    // },

    confirm: function() {
      var self = this;
      var formData = this.constructData();

      var errors = false;
      var $agreement = this.$el.find('#agree');
      var terms_accepted = $agreement.is(':checked');
      if (!terms_accepted) {

        app.controls.fieldError({
          element: $agreement,
          error: 'Please agree to the terms of use'
        });
        errors = true;
      }

      if (!app.utils.validate(this, formData)) errors = true;

      if (errors) return;

      var formatted_data = app.schema.process(formData, this.model);

      // inject missing data
      formatted_data.email = this.user.get('email');
      formatted_data.type = this.dwolla_data.type;

      if (formatted_data.type === 'business') formatted_data.businessClassification = '9ed492ab-7d6f-11e3-9907-5404a6144203';

      app.controls.loadLock();

      this.model.save(formatted_data).success(function(user) {
        self.parentView.user.set(user);
        app.controls.loadLock();
        self.parentView.next();
      }).fail(function(error) {
        app.controls.handleError(error);
      });
    }

  });
});