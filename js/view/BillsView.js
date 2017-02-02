/**
 * BillsView.js
 */

define([
  'app',
  'collection/bills/BillsCollection',
  // 'collection/users/TenantsCollection',
  'view/modals/ModalBillView',
  'view/tables/TableView',
  'view/tables/TableBillView',
  'text!templates/tables/table-bills.html'
],
function(
  app, 
  BillsCollection, 
  // TenantsCollection,
  ModalBillView, 
  TableView, 
  TableRowView, 
  TableRowTemplate
) {

  return Backbone.View.extend({

    className: 'collection-view',
    template: _.template(TableRowTemplate),

    tips: [
      { 
        'header': 'Winning wars',
        'body': 'Proin quis hendrerit justo, a vehicula nulla. Proin vulputate facilisis turpis ut lobortis. Proin molestie mattis justo eget posuere. Duis sed odio feugiat, interdum diam sed',
        'link': 'http://google.com'
      },
      { 
        'header': 'Getting ahead',
        'body': 'Ut tincidunt metus vel libero cursus pellentesque. Sed tincidunt, turpis ac efficitur egestas, tellus nibh iaculis purus, in aliquam elit eros nec elit.',
        'link': 'http://google.com'
      },
      { 
        'header': 'Slamm-a-jammin',
        'body': 'Sed tempus, eros et tempus egestas, sem diam iaculis nisl, ac ultricies lacus nunc sit amet nisl. Suspendisse lectus nulla, rhoncus non mauris nec, varius consequat felis.',
        'link': 'http://google.com'
      }
    ],

    initialize: function() {
      this.render();
      // var self = this;

      // this.tenants = new TenantsCollection();
      // this.tenants.fetch().then(function() {
      //   self.render();
      // }, function() {
      //   app.alerts.error('Something went wrong');
      // });
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

        modelName: 'Bill',
        collection: BillsCollection,
        row: TableRowView,
        
        options: {
          search: true,
          // edit: true,

          add: ModalBillView,
          addModalOptions: {
            action: 'add',
            eventName: 'modelAdded',
            // tenants: this.tenants
          }
        }
      });
      
      this.$el.html(this.tableView.$el);

      return this;
    }

  });
});