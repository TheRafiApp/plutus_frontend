/**
 * LedgerView.js
 */

define([
  'app',
  'collection/transfers/TransfersCollection',
  'view/modals/ModalLedgerView',
  'view/tables/TableView',
  'view/tables/TableTransferView',
  'text!templates/tables/table-transfers.html'
],
function(
  app, 
  TransfersCollection, 
  ModalAddView, 
  TableView, 
  TableRowView, 
  TableRowTemplate) {

  return Backbone.View.extend({

    className: 'collection-view',
    template: _.template(TableRowTemplate),

    tips: [
      { 
        'header': 'The Ledger',
        'body': 'Ledger entries represent transactions. All payments made via Rafi Payment will be displayed here, as well as any non-electronic payments recorded to a bill.',
        // 'link': 'http://google.com'
      },
      { 
        'header': 'Adding Entries',
        'body': 'You may also record miscellaneous expenses or income related to your properties here. ',
        // 'link': 'http://google.com'
      },
    ],

    initialize: function() {
      this.render();
    },

    attachEvents: function() {
      this.listening = true;
    },

    render: function() {
      if (!this.listening) this.attachEvents();
      if (this.tableView) this.tableView.tips.close();
      
      this.tableView = new TableView({
        title: 'Ledger',
        modelName: 'entry',
        modelPlural: 'entries',

        context: this,
        
        collection: TransfersCollection,
        row: TableRowView,
        
        options: {
          filter: true,
          totals: true,
          // search: true,
          edit: false,
          add: ModalAddView,
          addModalOptions: {
            action: 'add',
            eventName: 'modelAdded',
          }
        }
          
      });
      
      this.$el.html(this.tableView.$el);

      return this;
    },

    totals: function(tableView) {

      var total_amount = tableView.collection.pluck('amount').reduce(function(a,b) {
        return a + b;
      });
      
      return {
        transfer: {
          source_name: '', 
          destination: {
            name: ''
          }, 
          status: {
            state: ''
          },
          amount_pretty: app.utils.prettyMoney(total_amount)
        }
      };
    }

  });
});