/**
 * TablePropertyView.js
 */

define([
  'app',
  'text!templates/tables/table-row-property.html',
],
function(app, TableRowTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'row',

    events: {
      'click': 'viewPropertyUnits',
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

      this.$el.html(this.template({ property: data }))
      return this;
    },

    viewPropertyUnits: function(e) {
      if (!$('.properties-table').hasClass('editing')) {
        $('.row.selected').removeClass('selected');
        this.$el.addClass('selected');

        var route = app.router.getRoute();
        var model_id = this.model.id;

        app.router.navigate(route + '/' + model_id + '/units', { trigger: true });
      }
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

    dialogueConfirm: function() {
      var target = this.model.get('address');
      var message = 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    }
  }));
});