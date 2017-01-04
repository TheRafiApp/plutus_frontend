/**
 * AdminsView.js
 */

define([
  'app',
  'collection/users/AdminsCollection',
  'view/modals/ModalInviteView',
  'view/tables/TableView',
  'view/tables/TableUserView',
  'text!templates/tables/table-users.html'
],
function(
  app, 
  AdminsCollection, 
  ModalAddView, 
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

        modelName: 'admin',
        collection: AdminsCollection,
        row: TableRowView,
        
        options: {
          search: true,
          // edit: true,

          add: ModalAddView,
          addModalOptions: {
            action: 'invite',
            eventName: 'modelAdded',
          }
        }
      });
      
      this.$el.html(this.tableView.$el);

      return this;
    }

  });
});