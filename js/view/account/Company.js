/**
 * account/Company.js
 */

define([
  'app',
  'model/companies/CompanyModel',
  'collection/users/ManagersCollection',
  'text!templates/account/account-company.html',
],
function(app, CompanyModel, ManagersCollection, Template) {

  return Backbone.View.extend({

    className: 'account account-company',

    template: _.template(Template),

    initialize: function(options) {
      if (options) _.extend(this, options);

      this.bind('hardConfirm', this.refreshAccount, this);
      var self = this;

      this.account_model = this.parentModel;

      // var promises = [$.Deferred(), $.Deferred()];
      var promises = app.utils.promises(2);

      var company_id = this.account_model.get('company._id');
      this.company_model = new CompanyModel({ _id: company_id });
      this.company_model.fetch().then(function() {
        promises[0].resolve();
      });

      this.managers_collection = new ManagersCollection();
      this.managers_collection.fetch().then(function() {
        promises[1].resolve();
      });

      $.when.apply($, promises).then(function() {
        self.render();
      });
    },

    render: function() {

      this.$el.html(this.template({
        user: this.account_model.toJSON(),
        company: this.company_model.toJSON(),
        managers: this.managers_collection.toJSON(),
      }));

      this.delegateEvents();

      this.$el.find('.chosen').chosen();

      return this;
    }

  });
});
