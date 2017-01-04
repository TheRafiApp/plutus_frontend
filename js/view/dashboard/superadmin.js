/**
 * dashboard/admin.js
 */

define([
  'app',
  'text!templates/dashboard/admin.html'
],
function(app, DashTemplate) {

  return Backbone.View.extend({

    className: 'scroll-y',

    template: _.template(DashTemplate),

    initialize: function() {
      this.render();
    },

    render: function() {
  
      this.$el.html(this.template({
        account: app.session.user.toJSON(),
        tasks: this.tasks
      }));
      
      return this;
    }
    
  });
});