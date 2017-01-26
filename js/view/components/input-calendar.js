/**
 * /components/input-calendar.js
 */

define([
  'app',
  'kalendae',
  'text!templates/components/input-calendar.html',
],
function(app, kalendae, DateTemplate) {

  return Backbone.View.extend({

    className: 'input-calendar-container',

    template: _.template(DateTemplate),
    
    initialize: function(options) {
      _.extend(this, options);

      this.visible = false;
      
      this.render();

      if (this.overflowEscape) this.$el.addClass('fixed');
    },

    render: function() {
      var self = this;

      if (!this.rendered) {
        // Add elements
        
        this.input.wrap($('<div class="date-input-container" />'));
        this.button = $('<a href="#" class="action-toggle-calendar"></a>');
        this.button.insertAfter(this.input);

        // Init Kalendae

        this.date = new Kalendae(this.el, {
          months: 1,
          selected: moment(this.selected)
        });

        // Kalendae events

        this.date.subscribe('change' , function(date) {
          console.warn(date);

          self.populateDate();
        });

        this.populateDate();

        app.views.appView.addCalendarInput(this);

        this.initEventListeners();

        this.rendered = true;
      }

      return this;
    },

    initEventListeners: function() {
      var self = this;

      this.input.on('keyup', $.proxy(this.keyControl, this));
      this.input.on('change', $.proxy(this.handleInputChange, this));
      this.button.on('mousedown', $.proxy(this.toggleCalendar, this));
      this.input.on('blur', $.proxy(this.hide, this));

      $(window).on('scroll', function() {
        self.hide();
      })
      .on('resize', function() {
        self.hide();
      });

      $('.scroll-container').on('scroll', function() {
        self.hide();
      });

      this.delegateEvents();
    },

    keyControl: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var val = e.which;

      if ([27].contains(val)) {  // escape
        this.hide();
      } else if ([13].contains(val)) {  // return
        this.input.change();
      }
    },

    toggleCalendar: function(e) {
      var self = this;
      if (this.visible) {
        this.hide();
      } else {
        app.controls.wait(50).then(function() {
          self.show();
        });
      }
    },

    hide: function() {
      // console.log('hide')
      this.visible = false;
      this.$el.removeClass('visible');
    },

    show: function() {
      // console.log('show');
      this.input.focus();
      this.visible = true;
      this.updatePosition(this.input);
      this.$el.addClass('visible');
    },

    updatePosition: function(input) {
      var clientRect = input[0].getBoundingClientRect();
      var width = clientRect.right - clientRect.left;
      var top = clientRect.top + input.outerHeight();

      this.$el.css({
        top: top,
        left: clientRect.left,
        width: width
      });
    },

    handleInputChange: function() {
      var $input = this.input;
      var val = $input.val();
      if (!val) return;
      var parsed_date = moment(val);
      if (!parsed_date.isValid()) {
        app.controls.wait(50).then(function() {
           app.controls.fieldError({
            element: $input,
            error: 'Please enter a valid date'
          });
        });
        return;
      } else {
        this.updateCalendar(parsed_date);
      }

      $input.val(parsed_date.format('MM/DD/YYYY'));
    },

    updateCalendar: function(date) {
      console.log(date)
      this.manualUpdate = true;
      this.date.setSelected(date);
    },

    populateDate: function() {
      var dates = this.date.getSelectedRaw();
      console.log(dates);

      if (!dates.length) return;
      
      if (this.manualUpdate) {
        this.manualUpdate = false;
      } else {
        var date = dates[0].format('MM/DD/YYYY');
        this.input.val(date).change();
      }
      this.emitChange();
      return this;
    },

    emitChange: function(e) {
      this.context.trigger('dateChange');
    }
    
  });
});