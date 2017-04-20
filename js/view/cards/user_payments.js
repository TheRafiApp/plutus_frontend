/**
 * cards/user.js
 */

define([
  'app',
  'model/users/UserModel',
  'text!templates/cards/user_payments.html',
],
function(app, UserModel, CardTemplate) {

  return Backbone.View.extend({

    className: 'user-payments',

    events: {},

    template: _.template(CardTemplate),

    initialize: function(options) {
      _.extend(this, options);
      this.model = new UserModel(this.data);
      this.render();
    },

    render: function() {
      var data = this.model.toJSON();

      var amount;

      if (typeof this.amount !== 'undefined') {
        amount = app.utils.prettyMoney(this.amount);
        if (this.negative) amount = '-' + amount;
      } else {
        amount = 'N/A';
      }
      
      this.$el.html(this.template({ 
        user: data,
        amount: amount
      }));

      return this;
    }

  });
});