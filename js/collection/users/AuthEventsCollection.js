/**
 * AuthEventsCollection.js
 */

define([
  'app',
  'model/users/AuthEventModel'
],
function(app, AuthEventModel) {

  return app.Collection.extend({

    model: AuthEventModel,

    initialize: function(models, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options); 

      this.on('sync', this.reverse, this);
    },

    url: function() {
			return app.API() + 'users/' + this.options.parentModelId + '/authentication';
    },

    reverse: function() {
      this.models = this.models.reverse();
    }

  });

});