/**
 * AppView.js
 */

define([
  'app',
  'text!templates/app.html'
  // 'view/NavView'
],
function(app, AppTemplate) {

  return Backbone.View.extend({

    className: 'app',

    template: _.template(AppTemplate),

    initialize: function() {
      this.on('modalOpened', this.modalOpened, this);
      this.on('modalClosed', this.modalClosed, this);
      app.session.on('change:logged_in', this.load, this);
    },
    
    // on login change, redirect
    load: function() {
      this.render('dashboard');
    },

    roleClass: function() {
      var role = app.session.get('user_role');
      this.$el.addClass('role-' + role);
    },

    deviceIsSupported: function() {
      var map = {
        superadmin: {
          desktop: true,
          mobile: true
        },
        admin: {
          desktop: true,
          mobile: true
        },
        manager: {
          desktop: true,
          mobile: false
        },
        tenant: {
          desktop: true,
          mobile: true
        },
        landlord: {
          desktop: false,
          mobile: true
        }
      };
      var device = app.utils.isMobile() ? 'mobile' : 'desktop';
      var role = app.session.get('user_role');

      return { 
        role: role, 
        device: device, 
        support: map[role],
        val: map[role][device], 
      };
    },

    renderNotSupported: function() {
      var data = this.deviceIsSupported();
      var suggestion;
      _.each(data.support, function(supported, i) {
        if (supported) suggestion = i;
      });

      var msg = 'Sorry, the ' + data.role + ' app is not currently supported on ' + data.device + '. ';

      msg += 'Please use a ' + suggestion + ' device.';
      var $outer_container = $('<div class="not-supported" />');
      var $container = $('<div class="container" />');
      var $description = $('<div class="description" />');

      $description.text(msg);
      $container.append(app.templates.logo());
      $container.append($description);
      $outer_container.append($container);

      $('main').html($outer_container);
      $('body').removeClass('loading');
    },

    render: function(_route, _id) {
      var self = this;
      var deferred = $.Deferred();

      app.router.checkAuth().then(function() {

        if (app.views.loginView) {
          app.views.loginView.close();
          delete app.views.loginView;
        }

        if (!self.deviceIsSupported().val) return self.renderNotSupported();

        // first time build after log in
        if (!app.views.appView) {

          app.views.appView = self;
          self.$el.html(self.template());
          self.$el.prepend(app.templates.logo());

          // check if the user is onboarded
          if (!app.session.isOnboarded()) self.renderActivation();

          // if admin, load companies collection
          if (app.session.isSuperAdmin() && !app.collections.companies) {
            app.utils.loadCollection.get('companies/CompaniesCollection').then(function(CompaniesCollection) {
              app.collections.companies = new CompaniesCollection();
              app.collections.companies.fetch();
            });
          }
        }

        // check if nav is rendered
        if (!self.navView) self.navView = self.renderNav();

        // add role class to app element
        self.roleClass();

        // determine which view to load
        self.currentModel = _route;

        self.renderView(self.currentModel, _id).then(function() {
          $('body').removeClass('loading');
          deferred.resolve();
        });

      }).fail(function() {
        // close AppView & log out
        
        self.$el.removeClass(function(index, css) {
          return (css.match (/(^|\s)role-\S+/g) || []).join(' ');
        });
        
        self.close();
        self.navView = false;
        app.router.appView = false;
        app.router.navigate('/', { trigger: true, replace: true });

        deferred.resolve();
      });
      return deferred.promise();
    },

    renderView: function(_route, _id) {
      this.$el.find('.secondary').addClass('loading');
      
      if (!_route) return false;

      // files are case sensitive on Linux HD formatting :P
      var route = app.utils.capitalize(_route);

      var self = this;
      var view;
      var deferred = $.Deferred();
      
      if (app.views.modelView) delete app.views.modelView;
      if (app.views.currentView) delete app.views.currentView;

      console.log(route)
      
      app.utils.loadView.get(route + 'View').then(function(View) {
        app.views.currentView = new View({ subPage: _id });
        self.renderSecondary(app.views.currentView.$el);

        if (app.views.unitsView) delete app.views.unitsView;
        if (app.views.unitView) delete app.views.unitView;

        return deferred.resolve();
      }).fail(function(e) {
        console.warn(e);
      });

      return deferred.promise();
    },

    // renderOverlay: function(_route, _id) {
    //   // console.log(_route, _id);
    //   app.utils.loadView.get(_route + 'View').then(function(View) {
    //     new View({ _id: _id });
    //   });
    // },

    renderModel: function(_route, id) {
      this.$el.find('.tertiary').addClass('loading');
      var self = this;
      var deferred = $.Deferred();

      if (!_route) return deferred.reject();

      // console.log(_route, id)

      var models = {
        // 'users': 'user',
        'superadmins': 'user',
        'admins': 'user',
        'managers': 'user',
        'tenants': 'user',
        'landlords': 'user',
        'companies': 'company',
        'properties': 'property',
        'units': 'units', // loads a nested collection view
        'leases': 'lease',
        'bills': 'bill',
        'ledger': 'ledgerEntry',
        'rentroll': 'rentrollEntry',
        'mybill': 'mybill',
        'myleases': 'mylease'
      };

      var route = app.utils.capitalize(models[_route]);

      app.utils.loadView.get(route + 'View').then(function(View) {
        var view;

        // clear out active views
        if (app.views.modelView) {
          app.views.modelView.close();
          delete app.views.modelView;
        }

        if (app.views.unitView) {
          app.views.unitView.close();
          delete app.views.unitView;
        }

        if (app.views.unitsView) {
          app.views.unitsView.close();
          delete app.views.unitsView;
        }

        // UnitsView
        if (route === 'Units') {
          app.views.unitsView = new View({
            parentModelId: id
          });
          view = app.views.unitsView;

        // ModelView
        } else {
          app.views.modelView = new View({ _id: id });
          view = app.views.modelView;
        }
        
        // store active model id, view
        app.views.currentView.selected = id;

        // render the view and set up events
        self.renderTertiary(view.$el);
        view.delegateEvents();

        return deferred.resolve();
      });

      return deferred.promise();
    },

    renderUnit: function(id, uid) {
      this.$el.find('.quarternary').addClass('loading');

      var self = this;
      if (app.views.unitView) {
        app.views.unitView.close();
        delete app.views.unitView;
      }

      app.utils.loadView.get('UnitView').then(function(View) {
        app.views.unitView = new View({
          parentModelId: id,
          _id: uid
        });
        if (app.views.unitView && app.views.unitsView) {
          app.views.unitsView.selected = uid;
          self.renderQuarternary(app.views.unitView.$el);
          app.views.unitsView.$el.find('.table-container .row[data-id="' + uid + '"]').addClass('selected');
        }
      });
    },

    renderNav: function() {
      var self = this;

      app.utils.loadView.get('nav/' + app.session.get('user_role')).then(function(NavView) {
        var navView = new NavView();
        self.$el.find('.primary').html(navView.$el);
        // events get super messed up if you try to append this.$el to the dom before nav is loaded
        $('main').html(self.$el);
      });
      return true;
    },

    renderSecondary: function(renderedContent) {
      $('body').addClass('tertiary-hidden quarternary-hidden');
      console.log('removing loading class')

      
      this.$el.find('.secondary').html(renderedContent).removeClass('loading');
      return true;
    },

    renderTertiary: function(renderedContent) {
      this.$el.find('.tertiary').html(renderedContent);
      $('body').removeClass('tertiary-hidden');
      return true;
    },

    renderQuarternary: function(renderedContent) {
      this.$el.find('.quarternary').html(renderedContent);
      $('body').removeClass('quarternary-hidden');
      return true;
    },

    renderActivation: function() {
      var self = this;
      if (app.views.activateView) {
        app.views.activateView.close();
        delete app.views.activateView;
      }

      app.utils.loadView.get('account/Activate').then(function(ActivateView) {
        app.views.activateView = new ActivateView();
        self.$el.append(app.views.activateView.$el);
      });
    },

    modalOpened: function() {
      $('body').addClass('modal-open');

      // trap user focus to just inside the modal
      this.$el.find('input:not(:disabled), a').addClass('nofocus').attr('tabindex', '-1');
    },

    modalClosed: function() {
      $('body').removeClass('modal-open');

      // untrap user focus
      this.$el.find('.nofocus').removeClass('nofocus').removeAttr('tabindex');

      if (app.views.modalView) delete app.views.modalView;
    }

  });
});