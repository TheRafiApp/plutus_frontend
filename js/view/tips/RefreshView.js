/**
 * tips/RefreshView.js
 */

define([
  'app',
  'text!templates/tips/refresh.html'
],
function(app, Template) {

  return Backbone.View.extend({

    className: 'refresh-lock',

    events: {
      'click .action-refresh': 'refreshApp'
    },

    template: _.template(Template),

    initialize: function(options) {
      if (options) _.extend(this, options);

      this.render();
    },

    render: function() {
      var self = this;

      this.$el.html(this.template({
        logo: app.templates.logo({ fill: 'grey' })
      }));

    	return this;
    },

    refreshApp: function() {
      window.location.reload(true);
    }

  });
});