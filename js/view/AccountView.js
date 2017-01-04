/**
 * AccountView.js
 */

define([
  'app',
  'view/account/Profile',
  'text!templates/headers/header-account.html'
],
function(app, AccountProfileView, HeaderTemplate) {

  return Backbone.View.extend({

    className: 'tabs-view panel',

    events: {
      'click .tabs a': 'toggleTab',
      // 'mouseup .tabs a': 'preventDefault',
    },

    initialize: function(options) {
      if (options) _.extend(this, options);

      var self = this;
      app.views.accountView = this;

      this.template_container = _.template(HeaderTemplate);

      this.model = app.session.user;
      this.model.fetch().then(function() {
        self.render();
      });
    },

    render: function() {
      this.$el.html(this.template_container({ 
        user: this.model.toJSON() 
      }));
      this.loadView();

      return this;
    },

    loadView: function() {
      var self = this;
      var page = 'profile';
      var firstLoad = true;

      if (this.subPage) {
        page = this.subPage;
        firstLoad = false;
        this.$el.find('.tabs a').removeClass('active');
        this.$el.find('.tabs a[data-tab="' + page + '"]').addClass('active');
      }

      // files are case sensitive on Linux HD formatting :P
      file = app.utils.capitalize(page);

      app.utils.loadView.get('account/' + file).then(function(View) {
        var tab = new View({
          parentModel: self.model
        });

        app.views.accountView.currentTab = tab;
        
        self.$el.find('.account-view.scroll-y').html(tab.$el);
        tab.delegateEvents();
        // pass trigger: false to avoid the entire view from re-rendering
        app.router.navigate('account/' + page, { trigger: false, replace: firstLoad });
        // need to trigger the route event manually 
        app.router.trigger('route');

      }).fail(function(e) {
        app.router.navigate('404', { trigger: true, replace: true });
      });
    },

    toggleTab: function(e) {
      var page = $(e.currentTarget).attr('data-tab');
      
      this.subPage = page;
      this.loadView();
    }
    
  });
});