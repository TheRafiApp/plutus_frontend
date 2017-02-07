/**
 * UserModel.js
 */

define([
  'app'
],
function(app) {

  var UserModel = app.Model.extend({

    name: 'user',
    displayName: 'full_name',

    initialize: function(attributes, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options);
      if (!this.options.role) this.options.role = 'users';

      // event listeners for computed fields
      this.on('change:phone_pretty', this.updatePhone, this);
    },

    urlRoot: function() {
      return app.API() + this.options.role + '/';
    },

    defaults: {
      first_name: '',
      last_name: '',
    },

    schema: {
      phone: {
        type: 'phone'
      },
      charges: [{
        amount: {
          type: 'money'
        },
        phone: {
          type: 'phone'
        }
      }]
    },

    filters: [
      'full_name',
      'role',
      'profile',
      'phone_pretty',
      'initials',
      'status',
      'created',
      'updated',
      'intials',
    ],

    full_name: Backbone.computed('first_name', 'last_name', function() {
      if (this.isNew()) return '';
      return _.escape(this.get('first_name') + ' ' + this.get('last_name') || '');
    }),

    initials: Backbone.computed('first_name', 'last_name', function() {
      if (this.isNew()) return '';
      return _.escape(this.get('first_name')[0] + '' + this.get('last_name')[0]).toUpperCase();
    }),

    profile: Backbone.computed('_id', 'role', function() {
      var role = this.get('role');
      if (!role) return;
      return '/' + role + 's/' + this.get('_id');
    }),

    phone_pretty: Backbone.computed('phone', function() {
      var phone = this.get('phone');
      if (!phone) return;
      
      return app.utils.prettyPhone(phone);
    }),

    dwolla_account: Backbone.computed('role', 'dwolla', 'company', function() {
      var role = this.get('role');
      if (!['admin', 'tenant'].contains(role)) return;
      var account_location = '';

      if (role === 'admin') account_location = 'company.';

      account_location += 'dwolla';

      return this.get(account_location);
    }),

    primary_fs_status: Backbone.computed('dwolla_account', function() {
      var account = this.get('dwolla_account');
      if (!account) return 'N/A';

      var status = 'inactive';

      if (account.primary_funding_source) {
        var primary_id = account.primary_funding_source;
        var primary_fs = account.funding_sources[primary_id];

        if (primary_fs) {
          if (primary_fs.status === 'verified') {
            status = 'active';
          } else if (primary_fs.status === 'unverified'){
            status = 'inactive';

            if (primary_fs.microdeposits) {
              status = 'microdeposits ' + primary_fs.microdeposits;
            }
          }
        }
      }

      return status;
    }),

    updatePhone: function() {
      var phone_number = app.utils.uglyPhone(this.get('phone_pretty'));
      this.set('phone', phone_number);
    },

    validation: {
      first_name: {
        required: true,
        maxLength: 60,
        // pattern: 'alphabetical'
      },

      last_name: {
        required: true,
        maxLength: 60,
        // pattern: 'alphabetical'
      },

      email: function(input, field, attributes) {
        if (!input) return 'Email is required';
        if (input && !app.utils.validateContact(input)) return 'Please enter a valid email address';
      },

      phone: function(input, field, attributes) {
        if (input && !app.utils.validateContact(input)) return 'Please enter a valid phone number';
      },

      // password: {
      //   minLength: 8,
      //   pattern: 'password'
      // },

      // email: function(input, field, attributes) {
      //   if (!input && !attributes.phone) {
      //     return 'You must enter at least one contact method.';
      //   } else if (!attributes.phone) {
      //     if (!app.utils.validateContact(input)) return 'Please enter a valid email address';
      //   } else {
      //     if (input) {
      //       if (!app.utils.validateContact(input)) return 'Please enter a valid email address';
      //     }
      //   }
      // },
      // phone: function(input, field, attributes) {
      //   if (!input && !attributes.email) {
      //     return 'You must enter at least one contact method.';
      //   } else if (!attributes.email) {
      //     if (!app.utils.validateContact(input)) return 'Please enter a valid phone number';
      //   } else {
      //     if (input) {
      //       if (!app.utils.validateContact(input)) return 'Please enter a valid phone number';
      //     }
      //   }
      // },
      // 
    },

    resendInvitation: function(data, callbacks) {
      if (!data) data = {};
      
      var url = this.get('role') + 's/' + this.id + '/reinvite';
      var deferred = $.Deferred();

      app.utils.request({
        data: data, 
        path: url
      }).success(function(r) {
        return deferred.resolve(r);
      }).error(function(e) {
        return deferred.reject(e);
      });

      return deferred;
    },

    unremove: function(data, callbacks) {
      if (!data) data = {};
 
      var url = this.get('role') + 's/' + this.id + '/unremove';
      var deferred = $.Deferred();

      app.utils.request({
        data: data, 
        path: url,
        method: 'PUT',
      }).success(function(r) {
        return deferred.resolve(r);
      }).error(function(e) {
        return deferred.reject(e);
      });

      return deferred;
    }

  });

  return UserModel; 

});