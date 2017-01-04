/**
 * MyLeasesView.js
 */

define([
  'app',
  'collection/leases/MyLeasesCollection',
  'view/cards/lease_small',
  'text!templates/leases/myleases.html'
],
function(app, MyLeasesCollection, LeaseCard, MyLeasesTemplate) {

  return Backbone.View.extend({

    'className': 'panel',
    
    template: _.template(MyLeasesTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);
      var self = this;

      this.child_views = [];

      this.collection = new MyLeasesCollection();
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
        var $lease_card = new LeaseCard({
          data: model.toJSON()
        });

        self.$el.find('.scroll-y').append($lease_card.$el);
        self.child_views.push($lease_card);
      });

      return this;
    },

    showEmpty: function() {
      var message = '<div class="no-bills">';
      message += '<div class="icon-container"><div class="icon success"></div></div>';
      message += '<h2>You\'re all set!</h2>';
      message += '<p>You have no leases at this time.</p>';
      message += '</div>';

      this.$el.find('.scroll-y').html($(message));
    }

  });
});