/**
 * TableWebhookEventView.js
 */

define([
  'app',
  'text!templates/tables/table-row-webhook-event.html'
],
function(app, TableRowTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'row',

    events: {
      'click': 'viewModel',
    },

    template: _.template(TableRowTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);
      this.model.on('change', this.render, this);
      this.render();
    },

    render: function() {
      var data = this.model.toJSON();
      this.$el.attr('data-id', this.model.get('_id'));
      this.$el.html(this.template({ 
        webhook: data
      }));

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
    }

  }));
});