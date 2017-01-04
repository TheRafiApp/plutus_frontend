/**
 * LandlordsView.js
 */

define([
  'app',
  'collection/users/LandlordsCollection',
  'view/modals/ModalInviteView',
  'view/tables/TableView',
  'view/tables/TableUserView',
  'text!templates/tables/table-users.html'
],
function(
  app, 
  LandlordsCollection, 
  ModalInviteView, 
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

        modelName: 'landlord',
        collection: LandlordsCollection,
        row: TableRowView,
        
        options: {
          search: true,
          // edit: true,

          add: ModalInviteView,
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