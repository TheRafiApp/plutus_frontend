/**
 * WebhookeventsView.js
 */

define([
  'app',
  'collection/admin/WebhookEventsCollection',
  'view/tables/TableView',
  'view/tables/TableWebhookEventView',
  'text!templates/tables/table-webhook-events.html'
],
function(
  app, 
  Collection, 
  TableView, 
  TableRowView, 
  TableRowTemplate) {

  return Backbone.View.extend({

    className: 'collection-view',
    template: _.template(TableRowTemplate),

    initialize: function() {
      this.render();
    },

    attachEvents: function() {
      this.listening = true;
    },

    render: function() {
      if (!this.listening) this.attachEvents();
      if (this.tableView && this.tableView.tips) this.tableView.tips.close();

      if (!this.tips) this.$el.addClass('no-tips');

      this.tableView = new TableView({
        context: this,

        title: 'Webhook Events',
        modelName: 'webhook event',
        collection: Collection,
        row: TableRowView,
        
        options: {
          search: true,
          // filter: true,
          // totals: true
        }
      });
      
      this.$el.html(this.tableView.$el);

      return this;
    },

    // totals: function(tableView) {

    //   var collection = tableView.collection;
    //   if (collection.length < 1) return false;

    //   var income = collection.pluck('income');

    //   var total_amount = collection.pluck('income').reduce(function(a, b) {
    //     return (+a) + (+b);
    //   });

    //   var avg_beds = collection.pluck('beds').reduce(function(a, b) {
    //     return (+a) + (+b);
    //   }) / collection.length;

    //   var avg_baths = collection.pluck('baths').reduce(function(a, b) {
    //     return (+a) + (+b);
    //   }) / collection.length;

    //   var avg_sq_ft = collection.pluck('sq_ft').reduce(function(a, b) {
    //     return (+a) + (+b);
    //   }) / collection.length;

    //   var occupancy = 0;

    //   collection.pluck('occupied').map(function(x) {
    //     if (x) occupancy++;
    //   });

    //   occupancy = occupancy + '/' + collection.length;

    //   return {
    //     rent_roll: {
    //       beds: Math.round(avg_beds * 100) / 100,
    //       baths: Math.round(avg_baths * 100) / 100,
    //       sq_ft: Math.round(avg_sq_ft * 100) / 100,
    //       occupied: occupancy,
    //       income_pretty: app.utils.prettyMoney(total_amount)
    //     }
    //   };
    // }

  });
});