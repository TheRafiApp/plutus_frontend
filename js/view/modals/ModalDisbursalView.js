/**
 * ModalDisbursalView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'model/properties/DisbursalModel',
  'view/repeaters/date-calendar',
  'text!templates/modals/modal-disbursal.html'
],
function(app, ModalView, DisbursalModel, DateView, ModalTemplate) {

  return ModalView.extend({

    // 'events': {
    //   'keyup': 'keyControl',
    //   'click .action-confirm': 'confirm',
    //   'click .action-cancel': 'closeModal',
    //   'click .overlay': 'closeModal'
    // },

    template: _.template(ModalTemplate),

    // keyControl: function(e) {
    //   if (app.utils.getFocused().parentNode.className.contains('actions')) return;
    //   // esc
    //   if (e.which === 27) {
    //     this.closeModal();
    //   // enter
    //   } else if (e.which === 13) {
    //     this.confirm();
    //   }
    // },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;
      this.model = new DisbursalModel();

      this.renderModalView();
    },

    render: function() {
      // var self = this;

      // Backbone.Validation.bind(this);
      
      // app.views.appView.trigger('modalOpened');
      // app.views.modalView = this;

      var selected = false;

      var properties = app.views.currentView.tableView.collection.toJSON();

      if (this.selected) selected = this.selected;

      this.ready({
        properties: properties, 
        selected: selected
      });

      // init datepicker
      this.$el.find('.date-picker').html(new DateView({
        name: 'date',
        context: this
      }).$el);

      // app.utils.prepInputs(this);

      // $('.modal-container').html(this.$el).addClass('visible');

      // app.controls.maskMoney('.amount', this, 10);

      return this;
    },

    // constructData: function() {
    //   var $form = this.$el.find('form');
    //   var formData = $form.serializeObject();

    //   return app.schema.process(formData, this.model);
    // },

    // closeModal: function() {
    //   $('.modal-container').removeClass('visible');
    //   app.views.appView.trigger('modalClosed');
    //   this.close();
    // },

    // confirm: function() {
    //   var self = this;
      
    //   var formData = this.constructData();

    //   if (!app.utils.validate(this, formData)) return false;

    //   this.model.save(formData).then(function() {
    //     self.context.trigger(self.eventName);
    //     self.closeModal();
    //   }, function() {
    //     console.warn(arguments);
    //   });
    // }

  });
});