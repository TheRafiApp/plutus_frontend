/**
 * TableUnitView.js
 */

define([
  'app',
  'view/UnitView',
  'text!templates/tables/table-row-unit.html',
],
function(app, UnitView, TableRowTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'row',

    events: {
      'click': 'viewUnit',
      'click .action-remove': 'dialogueConfirm'
    },

    template: _.template(TableRowTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);
      this.model.parentModelId = this.parentModel.get('_id');
      this.on('confirmDelete', this.deleteModel, this);
      this.model.on('change', this.render, this);
      this.render();
    },

    render: function() {
      var data = this.model.toJSON();
      console.log(data);
      this.$el.attr('data-id', this.model.get('_id'));

      this.$el.html(this.template({ unit: data }));
      return this;

      
    },

    viewUnit: function() {
      if (this.$el.hasClass('selected')) return;
      if (this.$el.parent().parent().hasClass('editing')) return;

      $('.tertiary .row.selected').removeClass('selected');
      var unit_id = this.model.get('_id');
      var route = app.router.getPath().split('/');
      var check = route.slice(-1) == 'units';

      if (!check) route.pop();

      app.router.navigate(route.join('/') + '/' + unit_id, { trigger: true });
    },

    deleteModel: function() {
      var self = this;
      var $row = this.$el;

      this.parentView.trigger('modelDeleted');
      this.parentView.queue.push(this.model);

      $row.addClass('removing-1');
      setTimeout(function() {
        $row.addClass('removing-2')
        setTimeout(function() {
          $row.remove();
        }, 800);
      }, 100);
    },

    dialogueConfirm: function(user) {
      var user = this.model.get('number');
      var message = 'Are you sure you want to delete ' + user + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    }
  }));
});