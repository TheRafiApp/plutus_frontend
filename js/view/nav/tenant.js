/**
 * nav/tenant.js
 */

define([
  'app',
  'text!templates/nav/tenant.html'
],
function(app, NavTemplate) {

  return Backbone.View.extend({

    className: 'scroll-y',

    template: _.template(NavTemplate),

    events: {
      'click .action-logout': 'logout',
    },

    initialize: function() {
      app.router.on('route', function(route, params) {
        this.update();
      }, this);

      this.render();
      this.update();

      return this;
    },

    update: function() {
      var currentRoute = app.router.getRoute().split('?')[0];
      this.$container.find('ul li a').removeClass('active');
      this.$container.find('a[href="/' + currentRoute + '"]').addClass('active');
      this.$container.removeClass('active');
      $('.action-toggle-nav').removeClass('active');
    },

    render: function() {
      this.$el.html(this.template({ 
        logo: app.templates.logo(),
      }));

      this.$container = app.views.appView.$el.find('nav');

      return this;
    },

    logout: function() {
      var self = this;
      app.controls.logout().then(function() {
        // by the time this fires, the dom no longer contains nav
        self.$container.removeClass('active');
      });
    },

    toggleNav: function() {
      this.$el.toggleClass('active');
    }
    
  });
});