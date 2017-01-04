/**
 * DashboardView.js
 */

define([
  'app',
  // 'text!templates/account/dashboard.html'
],
function(app) {

  return Backbone.View.extend({

    // className: 'panel',

    viewName: function() {
      var role = app.session.get('user_role');
      
      return this.viewMap[role];
    },

    viewMap: {
      'superadmin': 'superadmin',
      'admin': 'admin',
      'manager': 'default',
      'landlord': 'default',
      'tenant': 'tenant'
    },

    // tasks: {
    //   email: 'We need your email address to send you important notifications, and to help you recover your password if you lose it.',
    //   phone: 'Add a phone to your account to keep your account safe, and to receive important text notifications. We won\'t share your contact information with anyone else!',
    //   dwolla: {
    //     manager: 'Creating or linking an existing Dwolla account is fast and easy, and will allow you to collect rent payments from tenants. Please take a moment to link this account!',
    //     tenant: 'Creating or linking an existing Dwolla account is fast and easy, and will allow you to pay your rent with your phone or computer. Please take a moment to link this account!'
    //   }
    // },

    initialize: function(options) {
      if (options) _.extend(this, options);
      this.render();
    },

    render: function() {
      // this.template = _.template(DashTemplate);
      
      // this.$el.html(this.template({ 
      //   account: app.session.user.toJSON(),
      //   tasks: this.tasks
      // }));
      var dashboard_view = this.renderDashboard();
      
      return this;
    },

    renderDashboard: function() {
      var self = this;
      var viewName = this.viewName();

      app.utils.loadView.get('dashboard/' + viewName).then(function(DashboardView) {
        self.childView = new DashboardView({ subPage: self.subPage });
        self.$el.html(self.childView.$el);
      });
    }
    
  });
});