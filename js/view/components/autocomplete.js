/**
 * /components/autocomplete.js
 */

define([
  'app',
  'text!templates/components/autocomplete.html',
],
function(app, ResultsTemplate) {

  return Backbone.View.extend({

    className: 'autocomplete',

    events: {
      // 'keyup': 'keyControl',
    },

    template: _.template(ResultsTemplate),
    
    initialize: function(options) {
      _.extend(this, options);

      if (this.overflowEscape) this.$el.addClass('fixed');
      return this;
    },

    render: function(data) {

      var self = this;

      this.$el.html(this.template({
        suggestions: data || []
      }));

      this.$el.find('.choices li:first-child a').addClass('active');
      app.views.appView.addAutocomplete(this);

      this.delegateEvents();

      return this;
    },

    update: function(data, input) {

      this.updatePosition(input);

      this.render(data);
      this.$el.addClass('visible');
    },

    updatePosition: function(input) {

      var clientRect = input[0].getBoundingClientRect();
      var width = clientRect.right - clientRect.left;
      var top = clientRect.top + input.outerHeight() - 10;

      this.$el.css({
        top: top,
        left: clientRect.left,
        width: width
      });
    },

    keyControl: function(e) {
      var val = e.which;

      if ([38].contains(val)) {         // up, right
        this.selectPrev();
      } else if ([40].contains(val)) {  // left, down
        this.selectNext();
      } else if ([27].contains(val)) {  // escape
        this.hide();
      } else if ([13].contains(val)) {  // return
        this.selectItem();
      }
    },

    selectPrev: function() {
      var $list = this.$el.find('li');
      var $current = this.$el.find('active');
      var index = $current.index();

      if (index > 0) {
        $current.removeClass('active');
        $($list[index - 1]).addClass('active');
      }
    },

    selectNext: function() {
      var $list = this.$el.find('li');
      var $current = this.$el.find('active');
      var index = $current.index();

      if (index < $list.length) {
        $current.removeClass('active');
        $($list[index + 1]).addClass('active');
      }
    },

    emitChange: function(e) {
      this.context.trigger('autocomplete-selection');
    }
    
  });
});