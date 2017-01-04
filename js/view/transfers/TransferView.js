/**
 * transfers/TransferView.js
 */

define([
  'app',
  'text!templates/repeaters/transfer.html'
],
function(app, AccountTransferTemplate) {

  return Backbone.View.extend({

    tagName: 'li',
    
    className: 'account-transfer',

    events: {
      'click .action-expand': 'toggleExpand'
    },

    template: _.template(AccountTransferTemplate),

    initialize: function() {
      this.render();
    },

    render: function() {
      var data = this.model.toJSON();
      this.$el.html(this.template({ transfer: data }));
      return this;
    },

    toggleExpand: function() {
      this.$el.find('.toggle').toggleClass('hidden');
    }


  });
});