/**
 * FilterView.js
 */

define([
  'app',
  'vendor/nouislider',
  'text!templates/repeaters/date-range.html',
  'text!templates/repeaters/filter.html',
  'text!templates/tables/filters.html',
],
function(app, noUiSlider, DateRangeTemplate, FilterTemplate, FiltersTemplate) {

  return Backbone.View.extend({

    className: 'filter',

    events: {
      'change .filter-checkbox': 'changeFilter',
      'click .action-clear-column': 'clearFilters'
    },

    template: _.template(FiltersTemplate),

    initialize: function(_options) {
      if (_options) _.extend(this, _options);
      this.render();
    },

    render: function() {
      var self = this;

      if (this.type == 'date_range') {
        this.renderDateRange();
      } else {
        this.renderFilters();
      }

      return this;
    },

    dateToTimestamp: function(moment_date) {
      console.log(moment_date);
      return moment_date.toDate().getTime();
    },

    renderDateRange: function(attrs) {
      var self = this;

      this.date_template = _.template(DateRangeTemplate);

      this.slider_loaded = 0;

      if (this.$slider) this.$slider.destroy();
      
      this.dates = this.attrs_all.map(function(attr) {
        return moment.utc(attr);
      });

      var start, end;

      var first = _.min(this.dates);
      var last = _.max(this.dates);

      if (attrs) {
        attrs = attrs.map(function(attr) {
          return moment.utc(attr);
        });
        start = _.min(attrs);
        end = _.max(attrs);
      } else {
        start = first;
        end = last;
      }

      // if only one model is present, first and last are the same which is not allowed
      if (first.isSame(last)) {
        last = moment.utc(last).add('days', 1);
      }

      if (start.isSame(end)) {
        end = moment.utc(end).add('days', 1);
      }

      this.$el.html(this.template());
      this.$el.find('.filters').html(this.date_template());

      var $slider = this.$el.find('.slider')[0];

      console.log(this.$el.find('.slider'));

      this.$slider = noUiSlider.create($slider, {
        range: {
          min: this.dateToTimestamp(first),
          max: this.dateToTimestamp(last)
        },
        connect: true,
        step: 24 * 60 * 60 * 1000, // day
        start: [
          this.dateToTimestamp(start), 
          this.dateToTimestamp(end)
        ],
        format: {
          to: function(input) {
            return parseInt(input);
          },
          from: function(input) {
            return parseInt(input);
          }
        }
      });

      var dateValues = [
        this.$el.find('#event-start')[0],
        this.$el.find('#event-end')[0]
      ];

      $slider.noUiSlider.on('update', function(values, handle) {
        // HACK: prevent event from firing until it is set up
        self.slider_loaded++;
        if (self.slider_loaded >= 2) self.changeDates();

        // update UI
        dateValues[handle].innerHTML = moment(+values[handle]).format('MM/DD/YYYY');
      });

    },

    renderFilters: function(filteredAttrs) { // takes an optional argument used to disable fields
      var self = this;
      var hasFilters = false;

      this.filter_template = _.template(FilterTemplate);

      this.$el.html(this.template());

      // console.log(this.field);

      this.attrs_all.forEach(function(attr) {

        // console.log(attr)

        var checked = false;
        var disabled = false;

        var hasField = self.context.filters[self.field];

        if (hasField && hasField.indexOf(attr + '') > -1) {
          checked = true;
          hasFilters = true;
        }

        if (filteredAttrs && filteredAttrs.indexOf(attr) < 0) disabled = true;

        self.$el.find('.filters').append(self.filter_template({
          attr: attr,
          id: self.field + '--' + app.utils.domFriendlyString(attr),
          checked: checked,
          disabled: disabled
        }));
      });

      var $col_header = this.context.$el.find('.header.fixed a[data-field="' + this.field + '"]').parent();

      if (hasFilters) {
        $col_header.addClass('has-filters');
      } else {
        $col_header.removeClass('has-filters');
      }

    },

    changeFilter: function(event) {
      var $target = $(event.currentTarget);
      var checked = $target[0].checked;
      var tag = $target.attr('data-value');

      var parentFilter = this.context.filters[this.field];

      if (checked) {
        this.context.filters[this.field].push(tag);
      } else {
        this.context.filters[this.field] = _.without(this.context.filters[this.field], tag);
      }

      // hack for fields that need to be sorted differently
      var $column = this.context.$el.find('.fixed a[data-field="' + this.field + '"]');
      if ($column.length === 0) $column = this.context.$el.find('.fixed a[data-field-sort="' + this.field + '"]');
      $column = $column.parent();

      if (this.context.filters[this.field].length === 0) {
        $column.removeClass('has-filters');
      } else {
        $column.addClass('has-filters');
      }

      this.context.filterCollection(this.field);
    },

    changeDates: function() {
      console.log(this.context.filters);
      this.context.filters[this.field].dates = this.$slider.get();
      this.$slider.get().forEach(function(x) {
        console.log(moment(x).format('MM/DD/YYYY'))
      });

      // only filter the collection if the date panel is the active one 
      if (this.$el.is(':visible')) {
        this.context.filterCollection(this.field);
      }
    },

    clearFilters: function() {
      if (this.type !== 'date_range') this.context.filters[this.field] = [];
      
      this.context.filterCollection();
      if (this.type == 'date_range') {
        this.renderDateRange();
      } else {
        this.renderFilters();
      }
      
    }

  });
});