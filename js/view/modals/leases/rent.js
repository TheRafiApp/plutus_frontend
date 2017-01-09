/**
 * rent.js
 */

define([
  'app',
  'text!templates/modals/leases/rent.html'
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