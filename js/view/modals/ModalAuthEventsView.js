 /**
 *  AuthEventsView.js
 */

define([
  'app',
  'view/modals/ModalView',
  'view/events/AuthEventView',
  'collection/users/AuthEventsCollection',
  'text!templates/modals/modal-auth-events.html'
],
function(
  app, 
  ModalView, 
  AuthEventView,
  AuthEventsCollection,
  ModalTemplate
) {

  return ModalView.extend({
    
    eventName: 'confirm',

    template: _.template(ModalTemplate),

    title: function() {
      return 'Authentication Events';
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.child_views = [];

      this.collection = new AuthEventsCollection(null, { parentModelId: this._id });

      this.collection.fetch().then(function() {
        self.renderModalView();
      });
    },

    render: function() {
      this.ready();

      var self = this;

      this.collection.each(function(eventModel) {
        var eventView = new AuthEventView({
          model: eventModel
        });

        self.child_views.push(eventView);
        self.$el.find('.choices').append(eventView.$el);
      });

      return this;
    }

  });
});