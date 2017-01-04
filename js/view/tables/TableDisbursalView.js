/**
 * TableDisbursalView.js
 */

define([
  'app',
  'view/modals/ModalDisbursalView',
  'text!templates/tables/table-row-disbursal.html',
],
function(app, ModalDisbursalView, TableRowTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'row',

    events: {
      // 'click': 'viewPropertyUnits',
      'click .action-remove': 'dialogueConfirm',
      'click .action-add': 'addDisbursal'
    },

    template: _.template(TableRowTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.on('confirmDelete', this.deleteModel, this);
      this.on('add', this.parentView.initialize, this.parentView);
      this.model.on('change', this.render, this);
      this.render();
    },

    render: function() {
      var data = this.model.toJSON();
      this.$el.attr('data-id', this.model.get('_id'));

      this.$el.html(this.template({ property: data }));
      return this;
    },

    addDisbursal: function() {
      this.modal = new ModalDisbursalView({
        selected: this.model.id,
        context: this,
        eventName: 'add'
      });
    }

    // dialogueConfirm: function() {
    //   var target = this.model.get('address');
    //   var message = 'Are you sure you want to delete ' + target + '?';

    //   app.controls.modalConfirm(message, 'confirmDelete', this);
    // }
  }));
});