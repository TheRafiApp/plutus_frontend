/**
 * account/activate/no_lease.js
 */

define([
  'app',
  'text!templates/account/activate/no_lease.html',
],
function(app, Template) {

  return Backbone.View.extend({

    className: 'no_lease',
    template: _.template(Template),

    initialize: function(options) {
      if (options) _.extend(this, options);
      this.render();
    },

    render: function() {

      this.$el.html(this.template({
        logo: app.templates.logo(),
        user: this.parentView.user.toJSON()
      }));

      return this;
    }
    
  });
});