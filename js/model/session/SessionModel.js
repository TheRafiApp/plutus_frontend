/**
 * SessionModel.js
 */

define([
  'app',
  'model/account/AccountModel'
],
function(app, AccountModel) {

  var SessionModel = Backbone.Model.extend({

    defaults: {
      logged_in: false,
      user_role: null
    },

    tokens: {},

    initialize: function() {
      this.updateAjaxSetup();
      // store AccountModel for use elsewhere
      app.models.AccountModel = AccountModel;
      this.user = new AccountModel();

      this.bind('change:logged_in', this.updateSession, this);
    },

    url: function() {
      return app.API();
    },

    isSuperAdmin: function() {
      return this.get('user_role') == 'superadmin';
    },

    isAdmin: function() {
      return this.get('user_role') == 'admin';
    },

    isManager: function() {
      return this.get('user_role') == 'manager';
    },

    isTenant: function() {
      return this.get('user_role') == 'tenant';
    },

    isLandlord: function() {
      return this.get('user_role') == 'landlord';
    },

    isOnboarded: function(_user) {
      if (app.config.debug && app.utils.stash.getItem('bypass-activation')) return true;

      var user = _user || app.session.user.toJSON();
      
      // superadmins do not get onboarded
      if (['superadmin'].contains(user.role)) return true;

      // establish the relevant steps to check
      var steps = app.utils.getOnboardingSteps(user);

      // check if steps returned false (doesn't include empty array)
      if (!steps) return false;

      // check if any steps are incomplete
      return !steps.some(function(step) {
        return !step.value;
      });
    },

    setTokens: function(tokens) {
      if (tokens.authorization) app.utils.stash.setItem('authorization', tokens.authorization);
      if (tokens.refresh) app.utils.stash.setItem('refresh', tokens.refresh);
      if (tokens.activation) app.utils.stash.setItem('activation', tokens.activation);

      this.updateAjaxSetup();

      return this;
    },

    updateSession: function() {
      // always clear activation tokens
      app.utils.stash.removeItem('activation');

      // log in
      if (this.get('logged_in')) {
        this.tokens = {};
        this.set('user_role', this.user.get('role'));

      // log out
      } else {
        // set last-login so we can populate the login form, with either phone or email
        app.utils.stash.setItem('last-login', this.user.get('email') || this.user.get('phone'));
        app.utils.stash.removeItem('authorization');
        app.utils.stash.removeItem('refresh');

        // clear session data
        this.user.clear().set(this.user.defaults);

        if (app.collections.companies) {
          app.collections.companies.reset();
          delete app.collections.companies;
        }

        // make sure views are all cleared
        if (app.views.accountView) {
          app.views.accountView.model.clear();
          delete app.views.accountView;
        }

        if (app.views.appView) {
          app.views.appView.close();
          delete app.views.appView;
        }
          
        if (app.views.activateView) {
          app.views.activateView.close();
          delete app.views.activateView;
        }

        if (app.views.currentView) {
          app.views.currentView.close();
          delete app.views.currentView;
        }
      }
    },

    updateAjaxSetup: function() {
      var self = this;

      $.ajaxSetup({
        contentType: 'application/json',
        dataType: 'json',
        beforeSend: function(xhr) {
          self.injectHeader(xhr, 'Authorization', app.utils.stash.getItem('authorization'));
          var act_token = app.utils.stash.getItem('activation');

          if (act_token) self.injectHeader(xhr, 'Activation', act_token);
          if (self.tokens.pass) self.injectHeader(xhr, 'Password', self.tokens.pass);
        },
      });
    },

    // Update Session

    updateSessionUser: function(userData) {
      this.user.set(userData);
      this.setTokens({
        authorization: userData.session.authorization_token, 
        refresh: userData.session.refresh_token
      });
    },

    // Inject Headers

    injectHeader: function(xhr, key, _value) {
      var value = _value;
      if (!_value) value = '';
      xhr.setRequestHeader(key, value);
      return xhr;
    },

    /**
     * Login
     * @param  {[object]}   options   [login credentials]
     * @param  {Function} callback    [optional callbacks (also uses promises)]
     * @return {[XHR object]}         [returns request]
     */
    
    login: function(options, callback) {
      if (!options) options = {};
      var refresh = options.refresh ? true : false;

      return app.utils.request({
        path: 'users/login',
        method: 'POST',
        data: options.data,
        refresh: refresh
      }, callback);
    },

    /**
     * Logout
     * @param  {Function} callback    [optional callbacks (also uses promises)]
     * @return {[XHR object]}         [returns request]
     */
    
    logout: function(callback) {
      return app.utils.request({
        path: 'users/logout',
        method: 'POST',
        refresh: true
      }, callback);
    },

    /**
     * Refresh
     * @param  {[object]}   options   [login credentials]
     * @param  {Function} callback    [optional callbacks (also uses promises)]
     * @return {[XHR object]}         [returns request]
     */
    
    refresh: function(options, callback) {
      if (!options) options = {};

      return app.utils.request({
        // path: 'users/login/refresh',
        path: 'users/tokens',
        method: 'GET',
        data: options.data,
        refresh: true
      }, callback);
    },

    // Forgot Password
    
    postPassword: function(data, callback) {
      return app.utils.request({
        data: data,
        path: 'users/password',
        method: 'POST'
      }, callback);
    },

    putPassword: function(data, callback) {
      return app.utils.request({
        data: data,
        path: 'users/password',
        method: 'PUT'
      }, callback);
    },

    // Account Activation

    setPassword: function(data, callback) {
      return app.utils.request({
        data: data,
        path: 'users/activate/password',
        method: 'POST'
      }, callback);
    },

    verifyCode: function(data, callback) {
      return app.utils.request({
        data: data,
        path: 'users/contact',
        method: 'PUT'
      }, callback);
    },

    // Reset & Activation Tokens

    verifyAuthentication: function(data, callback) {
      var self = this;
      var request = app.utils.request({
        data: data,
        path: 'users/activate/contact',
        method: 'PUT'
      }, callback);

      request.then(function(response) {
        if (response.session && response.session.activation_token) {
          self.setTokens({
            activation: response.session.activation_token
          });
        }
      });

      return request;
    },

    requestAuthentication: function(data, callback) {
      return app.utils.request({
        data: data,
        path: 'users/activate/contact',
        method: 'POST'
      }, callback);
    },

    // Set split
    
    updateLease: function(data, callback) {
      return app.utils.request({
        data: data,
        path: 'users/activate/leases',
        method: 'PUT'
      }, callback);
    },

    // Decline invite
    
    declineInvitation: function(data, callback) {
      return app.utils.request({
        data: data,
        path: 'users/activate/decline',
        method: 'POST'
      }, callback);
    },

    // Dwolla code

    // sendDwollaCode: function(data, callback) {
    //   var at = app.utils.stash.getItem('activation');
    //   var path = at ? 'users/activate' : 'dwolla';

    //   return app.utils.request({
    //     data: data,
    //     path: path + '/receive_authorization_code',
    //     method: 'POST'
    //   }, callback);
    // },

    // Activation funding sources
    
    // getFundingSources: function(data, callback) {
    //   var at = app.utils.stash.getItem('activation');
    //   var path = at ? 'users/activate' : 'dwolla';

    //   return app.utils.request({
    //     data: data,
    //     path: path + '/funding_sources',
    //     method: 'GET'
    //   }, callback);
    // },

    // setFundingSource: function(data, callback) {
    //   var at = app.utils.stash.getItem('activation');
    //   var path = at ? 'users/activate' : 'dwolla';

    //   return app.utils.request({
    //     data: data,
    //     path: path + '/funding_sources',
    //     method: 'PUT'
    //   }, callback);
    // },

    // Unlink Dwolla account

    // unlinkDwolla: function(data, callback) {
    //   return app.utils.request({
    //     data: data,
    //     path: 'dwolla/account_unlink',
    //     method: 'POST'
    //   }, callback);
    // },

    // Refreshing Tokens

    refreshTokens: function() {
      var self = this;
      var deferred = new $.Deferred();

      app.utils.request({ 
        path: 'users/tokens',
        method: 'GET',
        refresh: true,

      }).then(function(response) {
        self.updateSessionUser( response || {} );
        // console.log('👍👍👍 refreshTokens 👍👍👍');
        return deferred.resolve(response);
      }).fail(function(error) {
        // console.warn(error);
        app.router.navigate('/', { trigger: true, replace: true });
        return deferred.reject(error);
      });

      return deferred;
    }
    
  });

  return SessionModel;
  
});