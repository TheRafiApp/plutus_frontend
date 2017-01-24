/**
 * FundingSourceView.js
 */

define([
  'app',
  'text!templates/funding_sources/funding_source.html',
],
function(app, FundingSourceTemplate) {

  return Backbone.View.extend({

    className: 'funding-source-view',

    template: _.template(FundingSourceTemplate),

    events: {
      'click .action-delete': 'promptDelete',
      'click .action-send-md': 'sendMicro',
      'click .action-request-md': 'requestMicro',
      'click .action-make-primary': 'makePrimary'
    },

    initialize: function(options) {
      _.extend(this, options);

      this.on('confirmDelete', this.deleteModel, this);
      this.on('confirmPrimary', this.confirmPrimary, this);

      this.render();
    },

    render: function() {
      var funding_source = this.model.toJSON();

      // is this funding source primary?
      funding_source.primary = this.primary;

      // append microdeposit data from user
      var funding_source_cached = app.session.user.get('dwolla_account.funding_sources');

      _.extend(funding_source, funding_source_cached[funding_source.id]);

      console.log(funding_source);

      // for (var fs in microdeposits) {
      //   if (data.id === fs) {
      //     data.microdeposits = microdeposits[fs];
      //   }
      // }

      this.$el.html(this.template({ 
        funding_source: funding_source
      }));

      var $microdeposits = this.$el.find('.numbers-only');

      $microdeposits.mask('zz', {
        reverse: true,
        translation: {
          'a': {
            pattern: /[0]/,
            fallback: '0'
          },
          'z': {
            pattern: /[0-9]/
          }
        }
      });

      // force cursor to end on click or tabfocus
      $microdeposits.on('click focus', function() {
        $(this).val($(this).val());
      });
      
      return this.$el;
    },

    promptDelete: function() {

      var message = '';
      var target = this.model.get('name');

      if (this.primary) message += 'You are about to delete your primary funding source. ';

      if (this.parentView.collection.length === 1) {
        message += 'This is your only funding source. ';
      }

      message += 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    },

    deleteModel: function() {
      var self = this;

      app.controls.loadLock(true);

      this.model.destroy().then(function() {
        app.controls.loadLock(false);

        self.$el.fadeOut(function() {
          self.close();
        });
      }).fail(function() {
        console.log(arguments);
        app.alerts.error('Couldn\'t delete the funding source');
      });
    },

    sendMicro: function() {
      var self = this;

      var formData = {}, inputs = this.$el.find('form.micro-deposits').serializeArray();

      _.each(inputs, function(input) {
        formData[input['name']] = {};
        formData[input['name']]['value'] = parseFloat(('0.' + input['value'])).toFixed(2);
        formData[input['name']]['currency'] = 'USD';
      });

      formData = app.schema.process(formData, this.model);

      app.controls.loadLock(true);
      

      this.model.sendMicroDeposits(formData).always(function() {
        app.controls.loadLock(false);
      }).then(function() {
        self.parentView.parentView.initialize();
        app.alerts.success('Thanks for verifying your bank account!');
      }).fail(function() {
        console.warn(arguments);
        app.alerts.error('Mico Deposits could not be verified.');
      });
    },

    requestMicro: function() {
      var self = this;

      var formData = {};

      app.controls.loadLock(true);

      this.model.requestMicroDeposits(formData).always(function() {
        app.controls.loadLock(false);
      }).then(function() {
        self.parentView.parentView.initialize();
      }, function() {
        console.warn(arguments);
        app.alerts.error('Mico Deposits could not be initiated.');
      });
    },

    makePrimary: function() {
      var target = this.model.get('name');
      var message = 'Are you sure you want to use ' + target + ' as your primary bank account?';

      app.controls.modalConfirm(message, 'confirmPrimary', this);
    },

    confirmPrimary: function() {
      var self = this;

      this.model.setPrimary().then(function() {
        self.parentView.parentView.initialize();
        app.alerts.success('Your primary bank account has been updated!');
      }).fail(function(error) {
        app.controls.handleError(error);
      });

    }

  });
});