/**
 * PropertiesView.js
 */

define([
  'app',
  'collection/properties/PropertiesCollection',
  'view/modals/ModalPropertyView',
  'view/tables/TableView',
  'view/tables/TablePropertyView',
  'text!templates/tables/table-properties.html'
],
function(
  app, 
  PropertiesCollection, 
  ModalAddView, 
  TableView, 
  TableRowView, 
  TableRowTemplate) {

  return Backbone.View.extend({

    className: 'collection-view no-tips',
    template: _.template(TableRowTemplate),

    // tips: [
    //   { 
    //     'header': 'Assigning Blame',
    //     'body': 'Proin quis hendrerit justo, a vehicula nulla. Proin vulputate facilisis turpis ut lobortis. Proin molestie mattis justo eget posuere. Duis sed odio feugiat, interdum diam sed',
    //     'link': 'http://google.com'
    //   },
    //   { 
    //     'header': 'Damaging Property',
    //     'body': 'Ut tincidunt metus vel libero cursus pellentesque. Sed tincidunt, turpis ac efficitur egestas, tellus nibh iaculis purus, in aliquam elit eros nec elit.',
    //     'link': 'http://google.com'
    //   },
    //   { 
    //     'header': 'Threatening People',
    //     'body': 'Sed tempus, eros et tempus egestas, sem diam iaculis nisl, ac ultricies lacus nunc sit amet nisl. Suspendisse lectus nulla, rhoncus non mauris nec, varius consequat felis.',
    //     'link': 'http://google.com'
    //   },
    //   { 
    //     'header': 'Prank Calls',
    //     'body': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque efficitur, dui ut fringilla placerat, enim arcu lacinia odio, at dictum risus purus vitae ante.',
    //     'link': 'http://google.com'
    //   }
    // ],

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

        modelName: 'property',
        modelPlural: 'properties',
        collection: PropertiesCollection,
        row: TableRowView,
        
        options: {
          search: true,
          // edit: true,
          add: ModalAddView,
          addModalOptions: {
            action: 'add',
            eventName: 'modelAdded',
          }
        }
      });
      
      this.$el.html(this.tableView.$el);

      return this;
    }

  });
});