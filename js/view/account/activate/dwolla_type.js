/**
 * account/onboarding/dwolla_type.js
 */

define([
  'app',
  'text!templates/account/activate/dwolla_type.html',
],
function(app, OnboardingTemplate) {

  return Backbone.View.extend({

    className: 'dwolla',
    template: _.template(OnboardingTemplate),

    events: {
      'click .action-type': 'setType'
    },

    initialize: function(options) {
      if (options) _.extend(this, options);
      this.render();
    },

    render: function() {

      this.$el.html(this.template({
        logo: app.templates.logo()
      }));

      return this;
    },

    setType: function(e) {
      var data = {
        type: $(e.currentTarget).attr('data-type')
      };

      this.parentView.setDwollaData(data);
      this.nextStep();
    },

    nextStep: function() {
      this.parentView.next();
    }

  });
});