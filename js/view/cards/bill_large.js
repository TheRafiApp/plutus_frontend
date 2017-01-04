/**
 * cards/bill_large.js
 */

define([
  'app',
  'view/modals/ModalTransferView',
  'text!templates/cards/bill_large.html',
],
function(app, ModalTransferView, CardTemplate) {

  return Backbone.View.extend({

    events: {
      'click .action-lease': 'viewLease',
      'click': 'viewBill',
      
      'click .action-bill': 'handleAction'
    },

    template: _.template(CardTemplate),

    initialize: function(options) {
      _.extend(this, options);

      this.on('transferAdded', this.render, this);
      this.render();
    },

    render: function() {
      var data = this.model.toJSON();

      this.$el.html(this.template({ 
        bill: data,
        prettyMoney: app.utils.prettyMoney
      }));

      return this;
    },

    handleAction: function(e) {
      if (this.model.get('status') === 'paid') {
        this.viewBill();
      } else {
        this.showTransferModal();
      }
    },

    viewBill: function(e) {
      if (e && ['A', 'FOOTER'].contains(e.target.tagName)) return;
      var id = this.model.get('_id');
      var path = app.router.getPath();
      app.router.navigate(path + '/' + id, { trigger: true });
    },

    viewLease: function(e) {
      var id = this.model.get('lease._id');
      app.router.navigate('/myleases/' + id, { trigger: true });
    },

    showTransferModal: function() {
      var amount;

      if (this.model.get('type') === 'monthly') {
        var split = this.model.get('lease.split');
        var my_id = app.session.user.id;
        var mySplit;
        if (split) mySplit = split[my_id];
        amount = mySplit;
      } else {
        amount = this.model.get('total');
      }
      

      this.modal = new ModalTransferView({
        action: 'submit',
        model: this.model,
        eventName: 'transferAdded',
        context: this,
        amount: amount
      });
    }

  });
});