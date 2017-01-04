/**
 * dashboard/tenant.js
 */

define([
  'app',
  'view/bills/Current',
  'text!templates/headers/header-bills.html'
],
function(app, BillsView, HeaderTemplate) {

  return Backbone.View.extend({

    className: 'tabs-view panel',

    events: {
      'click .tabs a': 'toggleTab'
    },

    initialize: function(options) {
      if (options) _.extend(this, options);

      var self = this;
      app.views.currentView = this;

      this.template_container = _.template(HeaderTemplate);

      this.render();
    },

    render: function() {
      this.$el.html(this.template_container());
      this.loadView();

      return this;
    },

    loadView: function() {
      var self = this;
      var page = 'current';
      var firstLoad = true;

      if (this.subPage) {
        page = this.subPage;
        firstLoad = false;
        this.$el.find('.tabs a').removeClass('active');
        this.$el.find('.tabs a[data-tab="' + page + '"]').addClass('active');
      }

      // files are case sensitive on Linux HD formatting :P
      file = app.utils.capitalize(page);

      app.utils.loadView.get('bills/' + file).then(function(View) {
        var tab = new View({
          parentModel: self.model
        });

        app.views.currentView.currentTab = tab;
        
        self.$el.find('.bills-view').html(tab.$el);
        tab.delegateEvents();
        
        if (app.views.modelView) return;

        // pass trigger: false to avoid the entire view from re-rendering
        app.router.navigate('dashboard/' + page, { trigger: false, replace: firstLoad });
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