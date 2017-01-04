/**
 * account/activate/show_lease.js
 */

define([
  'app',
  'text!templates/account/activate/show_lease.html',
],
function(app, Template) {

  return Backbone.View.extend({

    className: 'show_lease',
    template: _.template(Template),

    events: {
      'click .action-next': 'nextStep'
    },

    initialize: function(options) {
      if (options) _.extend(this, options);
      this.render();
    },

    render: function() {
      var self = this;

      console.log(this.step)

      var user = this.parentView.user.toJSON();
      var lease = this.step.lease;
      
      var roommates = lease.tenants.filter(function(tenant) {
        if (tenant._id === user._id) return;
        return true;
      }).map(function(tenant) {
        return tenant.first_name + ' ' + tenant.last_name;
      });

      if (roommates.length === 0) roommates = false;

      var has_first = lease.charges.scheduled.some(function(charge) {
        return charge.type === 'first_month';
      });

      var has_last = lease.charges.scheduled.some(function(charge) {
        return charge.type === 'last_month';
      });

      var fees = [];

      if (has_first) fees.push('First Month');
      if (has_last) fees.push('Last Month');

      if (fees.length === 0) fees.push('None');

      this.$el.html(this.template({
        logo: app.templates.logo(),
        lease: lease,
        fees: fees,
        roommates: roommates,
        prettyMoney: app.utils.prettyMoney
      }));

      // setTimeout(function() {
      //   self.$el.addClass('active');
      // }, 700);

      return this;
    },

    nextStep: function() {
      this.parentView.next();
    }

  });
});