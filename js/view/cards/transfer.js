/**
 * cards/transfer.js
 */

define([
  'app',
  'model/users/UserModel',
  'text!templates/cards/transfer.html',
],
function(app, UserModel, CardTemplate) {

  return Backbone.View.extend({

    className: 'transfer',

    events: {},

    template: _.template(CardTemplate),

    initialize: function(options) {
      _.extend(this, options);

      console.log(this.data)

      var user_data = this.data.source;

      this.user = new UserModel(user_data);
      this.render();
    },

    render: function() {
      this.$el.html(this.template({ 
        user: this.user.toJSON(),
        transfer: this.data
      }));

      return this;
    }

  });
});