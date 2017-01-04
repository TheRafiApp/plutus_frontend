/**
 * tips/TipsView.js
 */

define([
  'app',
  'text!templates/tips/tips.html'
],
function(app, TipsTemplate) {

  return Backbone.View.extend({

    className: 'tips-view',

    events: {
      'click .action-tips-close': 'hide'
    },

    template: _.template(TipsTemplate),

    initialize: function(options) {
      if (options) _.extend(this, options);

      this.$parent = $(this.selector);
      this.render();
    },

    render: function() {
      var self = this;

      this.$el.html(this.template());
      
      var tips = this.context.tips;

      if (!tips) return false;

      tips.forEach(function(tip) {

        var $li = $('<li />');

        if (typeof tip == 'string') {
          $li.html('<p>' + tip + '</p>');
        } else if (typeof tip == 'object') {
          $li.append($('<h3>' + tip.header + '</h3>'));
          $li.append($('<p>' + tip.body + '</p>'));
          if (tip.link) $li.append($('<a href="' + tip.link + '" target="_blank">Read more &rarr;</a>'));
        }

        self.$el.find('.tips').append($li);

      });
        
      this.$parent.append(this.$el);

    	return this;
    },

    hide: function() {
      this.$parent.addClass('hide-tips');
    },

    show: function() {
      this.$parent.removeClass('hide-tips');
    }

  });
});