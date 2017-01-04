/**
 * cards/lease.js
 */

define([
  'app',
  'model/leases/LeaseModel',
  'text!templates/cards/lease.html',
],
function(app, LeaseModel, LeaseCardTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'lease grid__col grid__col--1-of-1', 

    events: {
      'click': 'viewLease',
      'click .action-edit-lease': 'editLease',
      'click .action-renew-lease': 'renewLease',
      'click .action-delete-lease': 'promptDelete'
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

    editLease: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.parentView.editLease(this);
    },

    renewLease: function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.parentView.renewLease(this);
    },

    promptDelete: function() {
      var start = moment.utc(this.model.get('start_date')).format('MM/DD/YYYY');
      var end_date = this.model.get('end_date');
      var end;

      if (end_date) end = moment.utc().format('MM/DD/YYYY');

      var target = start + ' – ' + (end || '∞');
      var message = 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    },
    
    deleteModel: function(event, override) {
      var self = this;
      var promise = $.Deferred();

      this.model.destroy().then(function() {
        self.parentView.initialize();
        return promise.resolve();

      }).fail(function(error) {
        if (!override) app.controls.handleError(error, null, self, 'deleteModel');
        return promise.reject(error);
      });

      return promise;
    },

    viewLease: function(e) {
      if (!$(e.target).hasClass('action-delete-lease')) {
        var id = this.model.get('_id');
        app.router.navigate('leases/' + id, { trigger: true });
      }
      
    }

  }));
});