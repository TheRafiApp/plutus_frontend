/**
 * RentRollView.js
 */

define([
  'app',
  'collection/leases/RentRollCollection',
  'view/tables/TableView',
  'view/tables/TableRentRollView',
  'text!templates/tables/table-rent-roll.html'
],
function(
  app, 
  RentRollCollection, 
  TableView, 
  TableRowView, 
  TableRowTemplate) {

  return Backbone.View.extend({

    className: 'collection-view',
    template: _.template(TableRowTemplate),

    tips: [
      { 
        'header': 'Tracking Rent',
        'body': 'The rent roll lists each unit, so you can keep track of which units are currently occupied, or were occupied at a given time. It also allows you to track monthly income per unit and overall.',
      },
      { 
        'header': 'Using Filters',
        'body': 'Use the filters in each column header to selectively display the data you want to see. You may filter by multiple columns and entries at the same time. Use the "clear" buttons to clear a column or reset all filters to default.',
      },
      { 
        'header': 'Adjusting Date',
        'body': 'Change the date input at the top of the screen to see data for any point in time.',
      }
    ],

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

        title: 'Rent Roll',
        modelName: 'unit',
        collection: RentRollCollection,
        row: TableRowView,
        
        options: {
          filter: true,
          date: true,
          totals: true
        }
      });
      
      this.$el.html(this.tableView.$el);

      return this;
    },

    totals: function(tableView) {

      var collection = tableView.collection;
      if (collection.length < 1) return false;

      var income = collection.pluck('income');

      var total_amount = collection.pluck('income').reduce(function(a, b) {
        return (+a) + (+b);
      });

      var avg_beds = collection.pluck('beds').reduce(function(a, b) {
        return (+a) + (+b);
      }) / collection.length;

      var avg_baths = collection.pluck('baths').reduce(function(a, b) {
        return (+a) + (+b);
      }) / collection.length;

      var avg_sq_ft = collection.pluck('sq_ft').reduce(function(a, b) {
        return (+a) + (+b);
      }) / collection.length;

      var occupancy = 0;

      collection.pluck('occupied').map(function(x) {
        if (x) occupancy++;
      });

      occupancy = occupancy + '/' + collection.length;

      return {
        rent_roll: {
          beds: Math.round(avg_beds * 100) / 100,
          baths: Math.round(avg_baths * 100) / 100,
          sq_ft: Math.round(avg_sq_ft * 100) / 100,
          occupied: occupancy,
          income_pretty: app.utils.prettyMoney(total_amount)
        }
      };
    }

  });
});