/**
 * router.js
 */

define([
  'app',
  'view/account/Login',
  'view/account/Activate'
],
function(app, LoginView, ActivateView) {

  var Router = Backbone.Router.extend({

    initialize: function() {
      var self = this;

      this.on('route', function(route, params) {
        // hide any visible alerts
        app.alerts.dismiss();

        // check if user has permission
        // the first time this runs, user tokens are still refreshing
        if (!app.session.get('logged_in')) {
          app.session.once('change:logged_in', self.hasPermission, self);
          return true;
        } else {
          self.hasPermission();
        }
      });
    },

    routes: {

      '' :                          'default',
      'dashboard/:id':              'renderApp',
      'dashboard/:id/:bid':         'renderLayer',

      'dashboard':                  'renderApp',

      'companies':                  'renderApp',
      'companies/:id':              'renderLayer',

      'superadmins':                'renderApp',
      'superadmins/:id':            'renderLayer',

      'admins':                     'renderApp',
      'admins/:id':                 'renderLayer',

      'managers':                   'renderApp',
      'managers/:id':               'renderLayer',

      'tenants':                    'renderApp',
      'tenants/:id':                'renderLayer',

      'landlords':                  'renderApp',
      'landlords/:id':              'renderLayer',

      'properties':                 'renderApp',
      'properties/:id':             'renderLayer',
      'properties/:id/:units':      'renderLayer',
      'properties/:id/:units/:uid': 'renderLayerPanel',

      'rentroll':                   'renderApp',
      'rentroll/:id':               'renderLayer',

      'leases':                     'renderApp',
      'leases/:id':                 'renderLayer',

      'myleases':                   'renderApp',
      'myleases/:id':               'renderLayer',

      'bills':                      'renderApp',
      'bills/:id':                  'renderLayer',

      'account':                    'renderApp',
      'account/:id':                'renderApp',

      'forgot':                     'showForgot',

      'password?:id':               'showReset',
      'confirm?:id':                'handleConfirm',
      'activate?:id':               'handleActivate',
      'decline?:id':                'renderDecline',

      'ledger':                     'renderApp',
      'ledger/:id':                 'renderLayer',

      // 'disbursals':                 'renderApp',
      // 'disbursals/:id':             'renderLayer',

      'webhooks':                   'renderApp',
      'webhookEvents':              'renderApp',

      '400':                        'permissionDenied',
      
      '*path':                      'notFound'

    },

    permissions: {

      // companies
      
      'companies': [
        'superadmin'
      ],
      'companies/*': [
        'superadmin'
      ],

      // users
      
      'superadmins': [
        'superadmin',
      ],

      'superadmins/*': [
        'superadmin',
      ],
      
      'admins': [
        'superadmin',
        'admin',
      ],

      'admins/*': [
        'superadmin',
        'admin',
      ],

      'managers': [
        'superadmin',
        'admin',
        'manager',
      ],
      'managers/*': [
        'superadmin',
        'admin',
        'manager',
      ],

      'tenants': [
        'superadmin',
        'admin',
        'manager',
      ],
      'tenants/*': [
        'superadmin',
        'admin',
        'manager',
      ],

      'landlords': [
        'superadmin',
        'admin',
        'manager',
      ],
      'landlords/*': [
        'superadmin',
        'admin',
        'manager',
      ],

      // account
      
      'account/contact': [
        'admin',
        'manager',
        'tenant',
        'landlord'
      ],
      'account/payment': [
        'admin',
        'manager',
        'tenant',
      ],
      'account/transfers': [
        'manager',
        'tenant',
      ],
      'account/data': [
        'superadmin',
        'admin',
      ],
      'account/company': [
        'admin'
      ],

      // properties
      
      'properties': [
        'superadmin',
        'admin',
        'manager',
      ],

      'properties/*': [
        'superadmin',
        'admin',
        'manager',
      ],

      'properties/*/units': [
        'superadmin',
        'admin',
        'manager',
      ],

      'properties/*/units/*': [
        'superadmin',
        'admin',
        'manager',
      ],

      // leases
      
      'leases': [
        'superadmin',
        'admin',
        'manager',
      ],

      'leases/*': [
        'superadmin',
        'admin',
        'manager',
      ],

      // 'myleases': [
      //   'tenant'
      // ],

      'myleases/*': [
        'tenant'
      ],

      // bills
      
      'bills': [
        'superadmin',
        'admin',
        'manager',
      ],

      'bills/*': [
        'superadmin',
        'admin',
        'manager',
        'tenant'
      ],

      // ledger
      
      'ledger': [
        'superadmin',
        'admin',
        'manager',
      ],

      'ledger/*': [
        'superadmin',
        'admin',
        'manager',
      ],

      // rent roll
      
      'rentroll': [
        'superadmin',
        'admin',
        'manager',
      ],

      'rentroll/*': [
        'superadmin',
        'admin',
        'manager',
      ],

      // disbursals
      
      // 'disbursals': [
      //   'superadmin',
      //   'admin',
      //   'manager',
      // ],

      // 'disbursals/*': [
      //   'superadmin',
      //   'admin',
      //   'manager',
      // ],
    },

    hasPermission: function() {
      var self = this;

      var current_route = this.getPath();
      var role = app.session.get('user_role');
      var matched = false;

      // loop through all permissions

      _.each(this.permissions, function(value, route) {
        if (matched) return;
        // if the permission path has an asterisk in it, we need to overwrite
        // the current route with the simplified one (users/3jfodm23 => users/*)
        if (route.contains('*')) {
          // build the regex
          var reg_exp_str = route;
          reg_exp_str = reg_exp_str.replace(/\*/g, '\\w*');
          var reg_exp = new RegExp('^' + reg_exp_str + '$');

          // check if the current route matches this regex, overwrite current route with sinplified route
          if (current_route.match(reg_exp)) {
            matched = true;
            current_route = route;
          }
        }
      });

      // if permissions are set for path, check if role is allowed
      if (this.permissions[current_route]) {
        if (!this.permissions[current_route].contains(role)) {
          self.navigate('400', { trigger: true, replace: true });
          return false;
        }
      }
      return true;
    },

    getPath: function() {
      return Backbone.history.getFragment().split('?')[0];
    },

    getPathArray: function() {
      return this.getPath().split('/');
    },

    getRoute: function() {
      return this.getPath().split('/')[0].split('?')[0];
    },

    getPage: function() {
      return this.getPath().split('/').slice(-1).toString();
    },

    checkAuth: function() {
      var self = this;
      var deferred = new $.Deferred();

      self.previous = self.current;
      self.current = self.getRoute();

      if (this.loaded) {
        if (app.session.get('logged_in')) {
          // deferred.resolve();
          return !self.hasPermission() ? deferred.reject() : deferred.resolve();
        } else {
          return deferred.reject();
        }
      } else {
        // var user_id = app.utils.stash.getItem('user');
        var r_token = app.utils.stash.getItem('refresh');

        if (r_token) {
          app.session.refresh().always(function() {
            self.loaded = true;
          }).then(function(response) {
            app.session.updateSessionUser(response);
            app.session.set({ 
              logged_in: true,
              user_role: app.session.user.get('role'),
            });
            return deferred.resolve();
          }).fail(function() {
            self.storeReferer();
            return deferred.reject();
          });
        } else {
          this.loaded = true;
          self.storeReferer();
          return deferred.reject();
        }
      }
      return deferred.promise();
    },

    storeReferer: function() {
      var url = this.getPath();
      if (['/', 'activate'].contains(url)) return false;
      app.session.referer = url;
    },

    default: function() {
      var self = this;
      this.checkAuth().then(function() {
        self.navigate('dashboard', { trigger: true, replace: true });
      }).fail(function() {
        self.renderLogin();
      });
    },

    // either render app or login view
    renderApp: function(_route, _manualRoute) {
      var id;

      // HACK: prevent CodeKit cachebuster from causing problems
      if (_manualRoute && _manualRoute.contains('ckcachecontrol')) _manualRoute = '';
      
      // tabbed pages need special treatment
      // TODO: put this logic into the routes instead of the function?
      if (['account', 'dashboard'].contains(this.getRoute())) id = this.getPathArray()[1];

      _route = this.getRoute();

      var route = _manualRoute || _route;

      var self = this;
      var deferred = $.Deferred();

      this.checkAuth().then(function() {
        if (self.loginView) {
          self.loginView.close();
          delete self.loginView;
        }

        if (app.views.appView) {
          app.views.appView.render(route, id).then(function() {
            return deferred.resolve();
          });
        } else {
          app.utils.loadView.get('AppView').then(function(AppView) {
            var appView = new AppView();
            appView.render(route, id).then(function() {
              return deferred.resolve();
            });
          });
        }
      }).fail(function() {
        self.navigate('/', { trigger: true, replace: true });
      });
      return deferred.promise();
    },

    // router needs to know whether to load nested view
    renderView: function(id) {
      var view;
      if (this.getRoute() == 'dashboard') {
        view = 'mybill';
        id = this.getPage();
        app.views.appView.renderModel(view, id);
      } else {
        view = this.getPage() == 'units' ? this.getPage() : this.getRoute();
        app.views.appView.renderModel(view, id);
      }
    },

    // rendering tertiary views
    renderLayer: function(_id) {
      var id;
      if (_id) id = _id;

      var self = this;
      this.checkAuth().then(function() {
        if (!app.views.appView || self.previous !== self.current) {
          self.renderApp(id).then(function() {
            self.renderView(id);
          });
        } else {
          self.renderView(id);
        }
      }).fail(function() {
        self.navigate('/', { trigger: true, replace: true });
      });
    },

    // rendering quarternary views
    renderLayerPanel: function(_id, _subroute, _uid) {
      var self = this;

      this.checkAuth().then(function() {
        if (!app.views.appView) {
          self.renderApp().then(function() {
            app.views.appView.renderModel(_subroute, _id).then(function() {
              app.views.appView.renderUnit(_id, _uid);
            });
          });
        } else {
          app.views.appView.renderUnit(_id, _uid);
        }
      }).fail(function() {
        self.navigate('/', { trigger: true, replace: true });
      });
    },

    // send contact auth token and login
    handleConfirm: function() {
      var self = this;

      var data = {
        token: app.url.query_string()
      };

      app.session.verifyCode(data).then(function(user) {
        app.session.updateSessionUser(user);
        app.session.set('logged_in', true);
        self.loaded = true;

        self.navigate('account/contact', { trigger: true, replace: true });

        app.controls.wait(800).then(function() {
          app.alerts.success('Thanks for verifying your contact method!');
        });

      }).fail(function(error) {
        self.renderApp();
        app.alerts.error('Sorry, your confirmation link is invalid');
      });
    },

    // send activation auth token and render
    handleActivate: function() {
      var self = this;

      if (!app.views.activateView) {

        this.checkAuth().then(function() {
          app.alerts.error('You must log out before activating a new account');
          app.router.navigate('/dashboard', { trigger: false, replace: true });
          self.renderApp();
        }).fail(function() {
          var data = {
            token: app.url.query_string()
          };

          app.session.verifyAuthentication(data).then(function(user) {
            // set the dwolla key
            // app.dwolla.key = user['dwolla_application_key'];

            // inialize activateView with user data
            self.renderActivate(user);
          }).fail(function(error) {
            app.alerts.error('Your invitation token has expired.');
            self.renderLogin();
          });
        });
      }
    },

    // render activation view
    renderActivate: function(user) {
      app.views.activateView = new ActivateView({
        user: user
      });
      $('main').html(app.views.activateView.$el);
    },

    // render login view
    renderLogin: function() {
      if (!app.views.loginView) {
        app.views.loginView = new LoginView();
        $('main').html(app.views.loginView.$el);
      } else {
        app.views.loginView.trigger('showLogin');
      }
    },

    // render decline invitation view
    renderDecline: function() {
      // var self = this;
      if (!app.views.declineView) {
        app.utils.loadView.get('account/Decline').then(function(DeclineView) {
          app.views.declineView = new DeclineView();
          $('main').html(app.views.declineView.$el);
        });
      }
    },

    // forgot password
    showForgot: function() {
      if (!app.views.loginView) {
        app.views.loginView = new LoginView();
        $('main').html(app.views.loginView.render());
      }
      
      app.views.loginView.trigger('showForgot');
    },

    // resetting password
    showReset: function(query_string) {
      var self = this;
      if (!app.views.loginView) {
        app.views.loginView = new LoginView();
        $('main').html(app.views.loginView.render());
      }

      var tokenData = {
        token: query_string
      };

      // send token and trigger events
      app.session.putPassword(tokenData).then(function(response) {
        app.views.loginView.user = response;
        app.views.loginView.trigger('showReset');
        app.views.loginView.trigger('saveToken');
      }).fail(function() {
        app.alerts.error('Your reset link has expired');
        self.navigate('/', { trigger: true, replace: true });
      });
      
    },

    permissionDenied: function() {
      this.renderApp('400');
    },

    notFound: function() {
      this.renderApp(null, '404');
    }
  });

  return Router;

});