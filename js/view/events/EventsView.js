 /**
 *  EventsView.js
 */

define([
  'app',
  'collection/companies/EventsCollection',
  'view/events/EventView',
  'text!templates/events/events.html'
],
function(app, EventsCollection, EventView, EventsTemplate) {

  return Backbone.View.extend(_.extend({}, Backbone.Events, {

    className: 'events-container',

    events: {
    },

    template: _.template(EventsTemplate),

    initialize: function(options) {
      if (options) _.extend(this, options);

      var self = this;

      this.child_views = [];

      this.collection = new EventsCollection();
      this.collection.fetch().then(function() {
      	self.render();
      });
    },

    render: function() {
    	var self = this;

      if (this.collection.length > 0) this.$el.html(this.template());

      this.collection.each(function(model) {
      	var event_view = new EventView({
      		model: model
      	});
      	self.$el.find('.events').append(event_view.$el);
      	self.child_views.push(event_view);
      });
      
      return this;
    }

  }));
});