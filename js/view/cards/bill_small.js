/**
 * cards/bill_small.js
 */

define([
  'app',
  'text!templates/cards/bill_small.html',
],
function(app, CardTemplate) {

  return Backbone.View.extend({

    events: {
      'click': 'viewBill'
    },

    template: _.template(CardTemplate),

    initialize: function(options) {
      _.extend(this, options);

      this.render();
    },

    render: function() {
      var data = this.model.toJSON();

      this.$el.html(this.template({ 
        bill: data,
        prettyMoney: app.utils.prettyMoney
      }));

      return this;
    },

    viewBill: function(e) {
      var id = this.model.get('_id');
      var path = app.router.getPath();
      app.router.navigate(path + '/' + id, { trigger: true });
    }

  });
});