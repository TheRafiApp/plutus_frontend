/**
 * 400View.js
 */

define([
  'app',
  'text!templates/400.html'
],
function(app, NotFoundTemplate) {

  return Backbone.View.extend({

    initialize: function() {
      this.render();
    },

    render: function() {
      this.template = _.template(NotFoundTemplate);
      this.$el.html(this.template());
      return this;
    }

  });
});