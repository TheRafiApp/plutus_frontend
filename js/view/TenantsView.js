/**
 * TenantsView.js
 */

define([
  'app',
  'collection/users/TenantsCollection',
  'view/modals/ModalInviteView',
  'view/tables/TableView',
  'view/tables/TableUserView',
  'text!templates/tables/table-users.html'
],
function(
  app, 
  TenantsCollection, 
  ModalInviteView, 
  TableView, 
  TableRowView, 
  TableRowTemplate) {

  return Backbone.View.extend({

    className: 'collection-view',
    template: _.template(TableRowTemplate),

    tips: [
      { 
        'header': 'Inviting Tenants',
        'body': 'When you invite a tenant to use Rafi Payment, they will be sent and email or text containing an invitation link. Don\'t forget to add them to a lease, otherwise they won\'t be able to finish onboarding!',
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

        modelName: 'tenant',
        collection: TenantsCollection,
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