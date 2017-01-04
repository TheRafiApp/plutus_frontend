/**
 * CompaniesCollection.js
 */

define([
  'app',
  'model/companies/CompanyModel'
],
function(app, CompanyModel) {

  return app.Collection.extend({

    model: CompanyModel,

    url: function() {
			return app.API() + 'companies/';
    }
    
  });

});