 /**
 *  EventView.js
 */

define([
  'app',
  'text!templates/events/event.html'
],
function(app, EventTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    tagName: 'li', 
    className: 'event',

    events: {
      'click .expand': 'expandEvent'
    },

    template: _.template(EventTemplate),

    initialize: function(options) {
      if (options) _.extend(this, options);

      this.render();
    },

    render: function() {

      this.$el.html(this.template({
        model: this.model.toJSON()
      }));
      
      return this;
    },

    expandEvent: function(e) {
      var $toggle = $(e.currentTarget);

      console.log(this.model)

      if ($toggle.hasClass('active')) {
        $toggle.removeClass('active');
        this.$el.find('.collapsed').removeClass('expanded');
      } else {
        $('.expand').removeClass('active');
        $('.collapsed').removeClass('expanded');
        $toggle.addClass('active');
        this.$el.find('.collapsed').addClass('expanded');
      }
    }
    
  }));
});