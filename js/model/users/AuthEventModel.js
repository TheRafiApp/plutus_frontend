/**
 * AuthEventModel.js
 */

define([
  'app',
  'ua-parser'
],
function(app, UAParser) {

  var AuthEventModel = app.Model.extend({

    name: 'authentication event',
    displayName: 'type',

    initialize: function(attributes, options) {
      if (!options) options = {};
      if (!this.options) this.options = {};

      this.options = _.extend(this.options, options);

      this.parser = new UAParser();

      window.parser = this.parser;
    },

    // urlRoot: function() {
    //   return app.API() + 'users/' + this.options.parentModelId + '/authentication';
    // },

    ua_data: Backbone.computed('user_agent', function() {
      var ua_string = this.get('user_agent');
      if (!ua_string) return;

      this.parser.setUA(ua_string);

      return this.parser.getResult();
    }),

    browser: Backbone.computed('ua_data', function() {
      var ua_data = this.get('ua_data');
      if (!ua_data) return;

      return ua_data.browser;
    }),

    os: Backbone.computed('ua_data', function() {
      var ua_data = this.get('ua_data');
      if (!ua_data) return;

      return ua_data.os;
    }),

    device: Backbone.computed('ua_data', function() {
      var ua_data = this.get('ua_data');
      if (!ua_data) return;

      return ua_data.device;
    }),

    engine: Backbone.computed('ua_data', function() {
      var ua_data = this.get('ua_data');
      if (!ua_data) return;

      return ua_data.engine;
    }),

    cpu: Backbone.computed('ua_data', function() {
      var ua_data = this.get('ua_data');
      if (!ua_data) return;

      return ua_data.cpu;
    }),

  });

  return AuthEventModel; 

});