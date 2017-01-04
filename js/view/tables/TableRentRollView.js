/**
 * TableRentRollView.js
 */

define([
  'app',
  'text!templates/tables/table-row-rent-roll.html'
],
function(app, TableRowTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'row',

    events: {
      'click': 'viewModel',
      'click .action-remove': 'dialogueConfirm'
    },

    template: _.template(TableRowTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);
      this.on('confirmDelete', this.deleteModel, this);
      this.model.on('change', this.render, this);
      this.render();
    },

    render: function() {
      var data = this.model.toJSON();
      this.$el.attr('data-id', this.model.get('_id'));
      this.$el.html(this.template({ rent_roll: data }));
      return this;
    },

    viewModel: function() {
      if (!$('.table').hasClass('editing')) {
        $('.table .row').removeClass('selected');
        this.$el.addClass('selected');

        var route = app.router.getRoute();
        var model_id = this.model.id;
        
        app.router.navigate(route + '/' + model_id, { trigger: true });
      }
    },

    deleteModel: function() {
      var self = this;
      var $row = this.$el;

      this.parentView.trigger('modelDeleted');
      this.parentView.queue.push(this.model);

      $row.addClass('removing-1');
      setTimeout(function() {
        $row.addClass('removing-2');
        setTimeout(function() {
          $row.remove();
        }, 800);
      }, 100);
    },

    dialogueConfirm: function() {
      var target = this.model.get('full_name');
      var message = 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    }
  }));
});