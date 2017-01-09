/**
 * fees_future.js
 */

define([
  'app',
  'text!templates/modals/leases/fees_future.html'
],
function(app, StepTemplate) {

  return Backbone.View.extend({

    className: 'step',

    template: _.template(StepTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.render();
    },

    render: function() {
      
      this.$el.html(this.template());

      return this;
    }

  });
});