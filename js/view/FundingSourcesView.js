/**
 * FundingSourcesView.js
 */

define([
  'app',
  'view/FundingSourceView',
  'collection/account/FundingSourcesCollection',
  'text!templates/funding_sources/funding_sources.html'
],
function(app, FundingSourceView, FundingSourcesCollection, FundingSourcesTemplate) {

  return Backbone.View.extend({

    className: 'form-model container loading',

    template: _.template(FundingSourcesTemplate),

    initialize: function(options) {

      _.extend(this, options);

      var self = this;

      this.collection = new FundingSourcesCollection();

      this.collection.bind('change', this.initialize, this);

      this.collection.fetch().then(function() {
        self.render();
      }).fail(function(error) {
        app.controls.handleError(error);
        self.render();
      });
    },

    render: function() {
      var self = this;

      this.collection.sortByField('name');

      this.$el.html(this.template());

      var primary_fs = app.session.user.get('dwolla_account.primary_funding_source');

      this.collection.each(function(funding_source) {

        // manually remove balance and removed from collection
        if (funding_source.get('type') == 'balance') return;

        // check if this is the primary fs
        var primary = false;
        // console.log(funding_source.id, primary_fs)
        if (funding_source.id == primary_fs) primary = true;

        var fs_view = new FundingSourceView({ 
          model: funding_source,
          parentView: self,
          primary: primary
        });

        self.$el.find('.funding-sources').append(fs_view.$el);

      });

      this.$el.removeClass('loading');
      return this.$el;
    }
    
  });
});