/**
 * MyLeaseView.js
 */

define([
  'app',
  'model/users/TenantModel',
  'model/leases/MyLeaseModel',
  'view/cards/user_payments',
  'view/modals/ModalSplitView',
  'text!templates/leases/mylease.html'
],
function(app, TenantModel, MyLeaseModel, UserCardView, ModalSplitView, MyLeaseTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    'className': 'panel lease-view',
    
    'events': {
      'click .action-edit-split': 'showSplitModal'
    },

    template: _.template(MyLeaseTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);
      var self = this;

      this.model = new MyLeaseModel({ _id: app.router.getPage() });
      this.model.fetch().then(function() {
        self.render();
      }).fail(function(e) {
        console.warn(e);
      });
    },

    attachEvents: function() {
      this.on('editSplit', this.initialize, this);
      this.listening = true;
    },

    render: function() {
      if (!this.listening) this.attachEvents();

      var self = this;

      this.$el.html(this.template({
        lease: this.model.toJSON(),
        prettyMoney: app.utils.prettyMoney
      }));

      // need to deep copy the tenants array so the sorting
      // doesn't impact the order of the split modal
      var tenants = $.extend(true, [], this.model.get('tenants'));
      var my_id = app.session.user.id;

      tenants = tenants.sort(function(a, b) {
        if (a._id === my_id) {
          return -1;
        } else if (b._id === my_id) {
          return 1;
        }
      });

      // console.log(tenants);

      var split = this.model.get('split');

      _.each(tenants, function(tenant) {
        var tenantModel = new TenantModel(tenant);
        var tenant_card = new UserCardView({ 
          data: tenantModel.toJSON(),
          amount: split[tenant._id]
        });

        self.$el.find('.split-cards').append(tenant_card.$el);
      });

      $('.tertiary').removeClass('loading');

      return this;
    },

    showSplitModal: function() {
      this.modal = new ModalSplitView({
        action: 'edit',
        eventName: 'editSplit',
        context: this
      });
    }
    
  }));
});