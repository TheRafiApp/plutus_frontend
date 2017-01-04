/**
 * bills/Current.js
 */

define([
  'app',
  'collection/bills/MyBillsCollection',
  'view/cards/bill_large',
  'text!templates/bills/current.html'
],
function(app, MyBillsCollection, BillCard, MyBillsTemplate) {

  return Backbone.View.extend({

    'className': 'panel',
    
    template: _.template(MyBillsTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);
      var self = this;

      this.child_views = [];

      this.collection = new MyBillsCollection({
        active: true
      });
      this.collection.fetch().then(function() {
        self.render();
      });
    },

    render: function() {
      var self = this;
      this.$el.html(this.template());

      // sort bills by due date, reverse
      // this.collection.sortByField('due_date');
      this.collection.models.reverse();

      if (this.collection.length < 1) this.showEmpty();
      
      this.collection.each(function(model) {
        var $bill_card = new BillCard({
          model: model
        });

        self.$el.find('.scroll-y').append($bill_card.$el);
        self.child_views.push($bill_card);
      });

      return this;
    },

    showEmpty: function() {
      var message = '<div class="no-bills">';
      message += '<div class="icon-container"><div class="icon success"></div></div>';
      message += '<h2>You\'re all set!</h2>';
      message += '<p>You have no bills at this time.</p>';
      message += '</div>';

      this.$el.find('.scroll-y').html($(message));
    }

  });
});