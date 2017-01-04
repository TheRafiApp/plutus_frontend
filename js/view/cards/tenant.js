/**
 * cards/tenant.js
 */

define([
  'app',
  'model/users/TenantModel',
  'text!templates/cards/user.html',
],
function(app, UserModel, CardTemplate) {

  return Backbone.View.extend({

    className: 'tenant grid__col grid__col--1-of-2',

    events: {},

    template: _.template(CardTemplate),

    initialize: function(options) {
      _.extend(this, options);
      this.model = new UserModel(this.data);
      this.render();
    },

    render: function() {
      var data = this.model.toJSON();
      this.$el.html(this.template({ user: data }));
      return this;
    }

  });
});