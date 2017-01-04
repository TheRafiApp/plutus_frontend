/**
 * AlertView.js
 */

define([
  'app',
  'text!templates/alert.html'
],
function(app, AlertTemplate) {

  return Backbone.View.extend({

    // el: '.alerts',

    events: {
      'click': 'closeAlert',
      'mouseenter': 'delayTimeout',
      'mouseleave': 'beginTimeout'
    },

    duration: 6000,

    template: _.template(AlertTemplate),

    initialize: function(options) {

      // dismiss existing alert
      app.alerts.dismiss();
      app.views.alertView = this;

      this.render(options);
    },

    render: function(options) {
      var self = this;

      this.$el.html(this.template({ alert: options }));
      this.$alert = this.$el.find('.alert');


      // Add class to slide in from top
      var slideIn = setTimeout(function() {
        // $alert.addClass('current');
        self.$alert.addClass('current');
        clearTimeout(slideIn);
      }, 10);

      // Only show alert for 6 seconds
      this.beginTimeout();

      return this;
    },

    beginTimeout: function() {
      var self = this;

      this.$alert.removeClass('restart');
      this.autoClose = setTimeout(function() {
        self.closeAlert();
        clearTimeout(this.autoClose);
      }, this.duration);

      // console.log('set: ' + this.autoClose);
    },

    delayTimeout: function() {
      // console.log(app.views.alertView);
      // console.log('clear: ' + this.autoClose);

      this.$alert.addClass('restart');
      clearTimeout(this.autoClose);
    },

    closeAlert: function(event) {
      var self = this;
      clearTimeout(this.autoClose);
      delete app.views.alertView;

      this.$alert.fadeOut(300, function() {
        // $(this).remove();
        self.close();
      });
    }

  });
});