/**
 * FundingSourcesCollection.js
 */

define([
  'app',
  'model/account/FundingSourceModel',
],
function(app, FundingSourceModel) {

  return app.Collection.extend({

    idAttribute: 'id',

    model: FundingSourceModel,

    url: function() {
      return app.API() + 'account/funding_sources';
    },

  });

});