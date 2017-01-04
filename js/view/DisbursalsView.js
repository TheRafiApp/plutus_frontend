/**
 * DisbursalsView.js
 */

define([
  'app',
  'collection/properties/DisbursalsCollection',
  // 'view/modals/ModalDisbursalView',
  'view/tables/TableView',
  'view/tables/TableDisbursalView',
  'text!templates/tables/table-disbursals.html'
],
function(
  app, 
  DisbursalsCollection, 
  // ModalAddView, 
  TableView, 
  TableRowView, 
  TableRowTemplate) {

  return Backbone.View.extend({

    className: 'collection-view',
    template: _.template(TableRowTemplate),

    tips: [
      { 
        'header': 'Recording Disbursals',
        'body': 'Keeping track of income you\'ve dispersed to your landlords is important. Each time you record a disbursal, the property balance will be updated, so you won\'t forget how much you pay out!',
        // 'link': 'http://google.com'
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

        title: 'Disbursals',
        modelName: 'property',
        modelPlural: 'properties',
        collection: DisbursalsCollection,
        row: TableRowView,
        
        options: {
          search: true,
          edit: true,
          // add: ModalAddView,
          // addModalOptions: {
          //   action: 'add',
          //   eventName: 'modelAdded',
          // }
        }
      });
      
      this.$el.html(this.tableView.$el);

      return this;
    }

  });
});