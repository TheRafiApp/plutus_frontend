/**
 * ManagersView.js
 */

define([
  'app',
  'collection/users/ManagersCollection',
  'view/modals/ModalInviteView',
  'view/tables/TableView',
  'view/tables/TableUserView',
  'text!templates/tables/table-users.html'
],
function(
  app, 
  ManagersCollection, 
  ModalInviteView, 
  TableView, 
  TableRowView, 
  TableRowTemplate) {

  return Backbone.View.extend({

    className: 'collection-view',
    template: _.template(TableRowTemplate),

    tips: [
      { 
        'header': 'Inviting Managers',
        'body': 'When you invite a manager to use Rafi Payment, they will be sent and email or text containing an invitation link.',
        // 'link': 'http://google.com'
      },
      { 
        'header': 'User Status',
        'body': 'A user\'s status will be "inactive" until they complete the activation process, at which point it will change to "active".',
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

        modelName: 'manager',
        collection: ManagersCollection,
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