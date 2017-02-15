/**
 * dashboard/admin.js
 */

define([
  'app',
  'view/events/EventsView',
  'text!templates/dashboard/admin.html',
  'view/components/input-calendar',
],
function(app, EventsView, DashTemplate, DateInput) {

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

      this.$el.append(new EventsView().$el);

      // this.start_date = new DateInput({
      //   input: this.$el.find('.start-date-input'),
      //   context: this,
      //   overflowEscape: true
      // });
      
      return this;
    }
    
  });
});