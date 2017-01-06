/**
 * tenants.js
 */

define([
  'app',
],
function(app) {

  return Backbone.View.extend({

    template: _.template(''),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      this.render();
    },

    render: function() {
      return this;
    }

  });
});