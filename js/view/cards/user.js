/**
 * cards/user.js
 */

define([
  'app',
  'model/users/UserModel',
  'text!templates/cards/user.html',
],
function(app, UserModel, CardTemplate) {

  return Backbone.View.extend({

    className: 'user grid__col grid__col--1-of-2',

    events: {},

    template: _.template(CardTemplate),

    initialize: function(options) {
      _.extend(this, options);
      this.model = new UserModel(this.data);
      this.render();
    },

    render: function() {
      var data = this.model.toJSON();
      if (this.transfers) console.log(this.transfers);
      
      this.$el.html(this.template({ user: data }));
      return this;
    }

  });
});