/**
 * nav/superadmin.js
 */

define([
  'app',
  'view/modals/ModalCompanyView',
  // 'view/modals/ModalAdminView',
  'view/modals/ModalPropertyView',
  'view/modals/ModalInviteView',
  'text!templates/nav/superadmin.html'
],
function(app, ModalCompanyView, ModalPropertyView, ModalInviteView, NavTemplate) {

  return Backbone.View.extend({

    // tagName: 'nav',
    // className: 'layer primary',

    template: _.template(NavTemplate),

    events: {
      'mousedown .action-add-company': 'addCompany',
      'mousedown .action-add-admin': 'addAdmin',
      'mousedown .action-add-manager': 'addManager',
      'mousedown .action-add-tenant': 'addTenant',
      'mousedown .action-add-landlord': 'addLandlord',
      'mousedown .action-add-property': 'addProperty',
      'click .action-logout': 'logout',
      'click .action-toggle-sub': 'toggleSub',
      'click .action-quick-add': 'toggleQuickAdd',
      'blur .action-toggle-sub': 'toggleSub',
      'blur .action-quick-add': 'toggleQuickAdd',
      'mousedown .switches .tooltip a': 'quickLink'
    },

    initialize: function() {
      var self = this;
      // this.role = app.session.get('user_role');

      // events
      app.router.on('route', function(route, params) {
        this.update();
      }, this);

      this.on({
        'companyAdded': this.companyAdded,
        'superAdminAdded': this.superAdminAdded,
        'adminAdded': this.adminAdded,
        'managerAdded': this.managerAdded,
        'tenantAdded': this.tenantAdded,
        'landlordAdded': this.landlordAdded,
        'propertyAdded': this.propertyAdded,
      });

      this.update();
      this.render();

      return this;
    },

    update: function() {
      var currentRoute = app.router.getRoute().split('?')[0];
      this.$el.find('ul li a').removeClass('active');
      this.$el.find('a[href="/' + currentRoute + '"]').addClass('active');
    },

    render: function() {
      this.$el.html(this.template({ 
        logo: app.templates.logo()
      }));
      return this;
    },

    logout: function() {
      app.controls.logout();
    },

    toggleQuickAdd: function() {
      var $tooltip = this.$el.find('.footer-actions .tooltip');
      var $btn = this.$el.find('.action-quick-add');
      if ($tooltip.hasClass('open')) {
        $tooltip.removeClass('open');
      } else {
        $tooltip.addClass('open');
        $btn.focus();
      }
    },

    toggleSub: function(e) {
      var $btn = $(e.currentTarget);
      var $tooltip = $btn.next('.tooltip');

      if ($tooltip.hasClass('open')) {
        $tooltip.removeClass('open');
      } else {
        if (e.type == 'click') {
          $tooltip.addClass('open');
          $btn.focus();
        }
      }
    },
    
    quickLink: function(e) { // fix for blur event listener bug
      e.preventDefault();
      var $target = $(e.currentTarget);
      var url = $target.attr('href');

      if (url === '#') return;
      app.router.navigate(url, { trigger: true, replace: false });
    },

    addCompany: function() {
      if (!app.session.isSuperAdmin()) return false;

      this.modal = new ModalCompanyView({
        action: 'add',
        context: this,
        eventName: 'companyAdded',
      });
    },

    addAdmin: function() {
      if (!app.session.isSuperAdmin()) return false;

      this.modal = new ModalInviteView({
        action: 'invite',
        role: 'admin',
        eventName: 'adminAdded',
        context: this
      });
    },

    addManager: function() {
      // this.modelName = 'manager';
      this.modal = new ModalInviteView({
        action: 'invite',
        role: 'manager',
        eventName: 'managerAdded',
        context: this
      });
    },

    addTenant: function() {
      // this.modelName = 'tenant';
      this.modal = new ModalInviteView({
        action: 'invite',
        role: 'tenant',
        eventName: 'tenantAdded',
        context: this
      });
    },

    addLandlord: function() {
      // this.modelName = 'landlord';
      this.modal = new ModalInviteView({
        action: 'invite',
        role: 'landlord',
        eventName: 'landlordAdded',
        context: this
      });
    },

    addProperty: function() {
      // this.modelName = 'property';
      this.modal = new ModalPropertyView({
        action: 'add',
        eventName: 'propertyAdded',
        context: this
      });
    },

    addTransfer: function() {
      // this.modelName = 'transfer';

      var ModalTransferView = this.TransferModal;
      this.modal = new ModalTransferView({
        action: 'add',
        type: 'electronic',
        eventName: 'transferAdded',
        context: this
      });
    },

    companyAdded: function() {
      app.router.navigate('/companies', { trigger: true });
    },

    superAdminAdded: function() {
      app.router.navigate('/superadmins', { trigger: true });
    },

    adminAdded: function() {
      app.router.navigate('/admins', { trigger: true });
    },

    managerAdded: function() {
      app.router.navigate('/managers', { trigger: true });
    },

    tenantAdded: function() {
      app.router.navigate('/tenants', { trigger: true });
    },

    landlordAdded: function() {
      app.router.navigate('/landlords', { trigger: true });
    },

    propertyAdded: function() {
      app.router.navigate('/properties', { trigger: true });
    },

  });
});