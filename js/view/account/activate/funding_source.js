/**
 * account/onboarding/funding_source.js
 */

define([
  'app',
  // 'collection/account/FundingSourcesCollection',
  'text!templates/account/activate/funding_source.html',
],
function(app, Template) {

  return Backbone.View.extend({

    className: 'fundingsource loading',
    template: _.template(Template),

    events: {
      'click .action-select': 'selectChoice',
      'click .action-next': 'next'
    },

    initialize: function(options) {
      var self = this;
      if (options) _.extend(this, options);

      // this.collection = new FundingSourcesCollection();
      
      app.session.getFundingSources().then(function(response) {
        // console.warn(response)
      // this.collection.fetch().then(function(response) {
        self.funding_sources = response;
        self.render();
      }).fail(function(error) {
        console.warn(error);
        self.render();
      }).always(function() {
        self.$el.removeClass('loading');
      });
    },

    render: function() {
      var self = this;

      // console.log(this.collection)

      // if (this.step.value) {
      //   this.parentView.next();
      //   return;
      // }
      
      // this.funding_sources = this.collection.toJSON();

      console.log(this.collection)

      var funding_sources = this.funding_sources.filter(function(funding_source) {
        return funding_source.name !== 'Balance';
      });

      this.$el.html(this.template({
        funding_sources: funding_sources
      }));

      return this;
    },

    selectChoice: function(e) {
      this.$el.find('.action-select').removeClass('active');
      $(e.currentTarget).addClass('active');
    },

    next: function() {
      if (this.$el.find('.choices .active').length !== 1) {
        app.alerts.error('Please select a bank account');
        return;
      }
      var self = this;

      var data = {
        funding_source: this.$el.find('.choices .active').attr('data-id')
      };
      
      // var id = this.$el.find('.choices .active').attr('data-id');
      // var model = this.collection.get(id);

      app.session.setFundingSource(data).then(function() {
      // model.save().then(function() {
        self.parentView.next();
      }).fail(function(error) {
        console.warn(error);
      });
    }

  });
});