/**
 * LeasesView.js
 */

define([
  'app',
  'collection/leases/LeasesCollection',
  'view/modals/ModalLeaseView',
  'view/tables/TableView',
  'view/tables/TableLeaseView',
  'text!templates/tables/table-leases.html'
],
function(
  app, 
  LeasesCollection, 
  ModalAddView, 
  TableView, 
  TableRowView, 
  TableRowTemplate) {

  return Backbone.View.extend({

    className: 'collection-view',
    template: _.template(TableRowTemplate),

    tips: [
      { 
        'header': 'Creating Leases',
        'body': 'To create a lease, you should first create a property and a unit, and then add the lease to the unit.',
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

        modelName: 'lease',
        collection: LeasesCollection,
        row: TableRowView,
        
        options: {
          search: true,
          edit: false,
          add: false
        }
      });
      
      this.$el.html(this.tableView.$el);

      return this;
    }

  });
});