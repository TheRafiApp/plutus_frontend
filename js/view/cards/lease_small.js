/**
 * cards/lease.js
 */

define([
  'app',
  'model/leases/LeaseModel',
  'text!templates/cards/lease_small.html',
],
function(app, LeaseModel, LeaseCardTemplate) {

  return Backbone.View.extend({

    events: {
      'click': 'viewLease'
    },

    template: _.template(LeaseCardTemplate),

    initialize: function(options) {
      _.extend(this, options);

      this.model = new LeaseModel(this.data);
      this.render();
    },

    render: function() {
      this.on('confirmDelete', this.deleteModel, this);

      var state = 'past';
      var start_date = this.model.get('start_moment');
      var end_date = this.model.get('end_moment');
      var today = moment.utc();

      if (start_date < today && today < end_date) {
        state = 'active';
      } else if (start_date > today) {
        state = 'future';
      }

      this.$el.html(this.template({ 
        lease: this.model.toJSON(),
        state: state,
        tenants: this.tenants,
        prettyMoney: app.utils.prettyMoney
      }));
      
      return this;
    },

    viewLease: function(e) {
      var id = this.model.get('_id');
      var path = app.router.getPath();
      app.router.navigate(path + '/' + id, { trigger: true });
      
    }

  });
});