/**
 * RentrollEntryView.js
 */

define([
  'app',
  'view/ModelView',
  'view/cards/user',
  'model/leases/RentRollModel',
  'text!templates/properties/rentrollentry.html'
],
function(app, ModelView, UserCardView, RentRollModel, RentRollTemplate) {

  return Backbone.View.extend({

    className: 'user-view',

    events: {
      'click .action-reinvite': 'resendInvitation'
    },

    template: _.template(RentRollTemplate),

    initialize: function(options) {
      _.extend(this, options);
      var self = this;
      var role = app.router.getRoute();

      this.model = new RentRollModel({ _id: this._id });
      this.model.fetch().then(function() {
        self.render();
      });
    },

    render: function() {

      this.ModelView = new ModelView({
        context: this,

        options: {
          edit: true,
          delete: true
        }
      });

      this.$el.html(this.ModelView.$el);

      // var source = this.model.get('source');

      // this.$el.find('.source').html(new UserCardView({
      //   data: source
      // }).$el);

      // var destination = this.model.get('destination');

      // this.$el.find('.destination').html(new UserCardView({
      //   data: destination
      // }).$el);

      return this;
    }
    
  });
});