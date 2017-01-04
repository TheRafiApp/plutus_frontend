/**
 * ModalLedgerView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'collection/properties/PropertiesCollection',
  'model/transfers/TransferModel',
  'view/repeaters/date-calendar',
  'text!templates/modals/modal-ledger.html'
],
function(
  app, 
  ModalView, 
  PropertiesCollection, 
  TransferModel, 
  DateView, 
  ModalTransferTemplate
){

  return ModalView.extend({

    eventName: 'confirm',

    title: function() {
      return this.action + ' Ledger Entry';
    },

    template: _.template(ModalTransferTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;
      if (!this.model) this.model = new TransferModel(null, {
        action: 'add'
      });

      this.properties = new PropertiesCollection();
      this.properties.fetch().then(function() {
        self.renderModalView();
      });
    },

    render: function() {
      var self = this;

      this.ready({
        properties: this.properties.toJSON()
      });

      // init calendar
      this.$el.find('.date-picker').html(new DateView({
        context: this,
        name: 'date'
      }).$el);

      return this;
    }
    
  });
});