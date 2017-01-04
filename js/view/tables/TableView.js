/**
 * tables/TableView.js
 */

define([
  'app',
  'kalendae',
  'view/tables/FilterView',
  'text!templates/tables/table-collection-headers.html',
  'text!templates/tables/table-container-collection.html',
],
function(app, kalendae, FilterView, TableCollectionHeader, TableCollectionContainer) {

  return Backbone.View.extend({
    
    className: 'table-view',

    events: {
      // close child view
      'click .sub-header-target': 'hideTertiary',

      // crud
      'click .action-edit': 'toggleEdit',
      'click .action-cancel': 'render',
      'click .action-save': 'promptSave',
      'click .action-add': 'addModel',

      // tips
      'click .action-show-tips': 'showTips',
      
      // event hacks
      'click .filter-label': 'filterHack',
      'click .chosen-choices': 'chosenFocus',
      'mousedown .filter': 'preventDefault',
      'mousedown .filter-label': 'preventDefault',

      // toggle filters
      'click .action-filters': 'clickedFilter',
      'blur .action-filters': 'hideFilters',

      // sorting / searching collection
      'click .action-clear-filters': 'clearFilters',
      'click .action-clear-search': 'clearSearch',
      'click .action-sort': 'sortCollection',
      'click .action-search': 'searchCollection',
      // 'keyup .search-field': 'searchCollection',
      'search .search-field': 'searchCollection',
    },

    template_header: _.template(TableCollectionHeader),
    template_container: _.template(TableCollectionContainer),

    applyCollection: function() {
      var Collection = this.collection;
      this.collection = new Collection();
      this.collection_applied = true;
    },

    preventDefault: function(e) {
      e.stopPropagation();
      e.preventDefault();
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      if (!this.collection) console.error('TableView missing collection');

      if (!this.modelPlural) this.modelPlural = this.modelName + 's';

      if (this.options.filter) {
        if (this.options.search) {
          console.error('TableView does not support filter and search together');
        }
        this.filters = {};
        this.filterViews = {};
      }

      var self = this;
      this.child_views = [];
      this.queue = [];

      this.template = this.context.template;

      if (!this.collection_applied) this.applyCollection();

      this.collection.fetch().then(function() {
        self.collection_backup = self.collection.clone();
        self.render();
      }, function(error) {
        app.alerts.error(error.responseJSON.message);
      });

    },

    attachEvents: function() {
      this.on('modelAdded', this.modelAdded, this);
      // this.on('batchSave', this.batchSave, this);

      if (this.context.tips) this.renderTips();
      
      this.listening = true;
    },

    render: function() {

      app.collections.currentCollection = this.collection;

      this.renderContainer();
      this.renderTable();

      var clone = this.$el.find('.table').clone();

      // Fixed header hack
      this.$el.find('.sub-header').html(clone);

      if (!this.listening) this.attachEvents();

      if (this.collection.length < 1) return this;

      // Render filters
      if (this.options.filter) this.renderFilters();

      // Render date
      if (this.options.date) this.renderDate();

      // Nested view needs event delegation
      this.delegateEvents();
      
      // Highlight row
      if (app.views.modelView || app.views.unitsView) {

        var id;

        if (app.views.modelView) {
          id = app.views.modelView.model.get('_id');
        } else if (app.views.unitsView) {
          id = app.views.unitsView.parentModelId;
        }

        this.$el.find('.row[data-id="' + id + '"]').addClass('selected');
      }

      return this;
    },

    renderContainer: function() {
      var self = this;

      // Build the table container
      this.$el.html(this.template_container({
        options: this.options
      }));

      this.$el.find('.table-container').html(this.template({
        role: app.session.get('user_role')
      }));

      if (!app.utils.isMobile()) {

        this.$search_field = this.$el.find('.search-field').chosen()

        // on uncheck
        .change(function(e) {
          $(this).find('option:not(:selected), option:empty').remove().trigger('chosen:updated');
          self.searchCollection({
            event: {
              target: self.$el.find('.search-field')
            }
          });
        });

        // bind events to chosen container
        this.$search_chosen = this.$el.find('.chosen-container')

        .bind('keyup', function(e) {
          var value = $(this).find('input').val();
          self.keyupSearch(e, value);
        })

        .bind('keydown', function(e) {
          // if they hit comma or line break, don't add it to the field
          if (e.which === 13 || e.which === 188) e.preventDefault();
        })

        .find('input').bind('blur', function() {
          var value = $(this).val();
          self.updateSearch(value);
        });

      // if isMobile, remove search fields
      } else {
        this.$el.find('.search-field').remove();
        this.$el.find('.action-search').remove();
        this.$el.find('.action-clear-search').remove();
      }
    },

    keyupSearch: function(e, value) {
      if (e.which === 13 || e.which === 188) { // Enter or Comma
        
        // if the tag already exists
        if (this.$search_field.find('option[value="' + value + '"]').length > 0) {
          this.$search_chosen.val('');
          return;
        }

        this.$search_field
        .append('<option value="' + value + '" selected>' + value + '</option>')
        .trigger('chosen:updated');

        this.searchCollection();
      }
    },

    updateSearch: function(value) {
      if (value === '') return false;

      // if the tag already exists
      if (this.$search_field.find('option[value="' + value + '"]').length > 0) {
        this.$search_chosen.val('');
        return;
      }

      this.$search_field
      .append('<option value="' + value + '" selected>' + value + '</option>')
      .trigger('chosen:updated');
    },

    removeTags: function(event, tag) {
      // remove a single tag, or all tags
      if (tag) {
        this.$search_field.find('option[value="' + tag + '"]').remove();
      } else {
        this.$search_field.find('option').remove();
      }
      // trigger chosen update
      this.$search_field.trigger('chosen:updated');
    },

    renderTable: function() {
      var self = this;
      var message = false;

      if (this.collection.length < 1) message = 'No ' + this.modelPlural + ' found';

      var header_info = {
        model: app.utils.capitalize(this.modelName),
        count: this.collection.length
      };

      if (this.modelPlural) header_info.model_plural = app.utils.capitalize(this.modelPlural);

      this.$el.find('.meta').html(this.template_header({
        header: header_info,
        title: this.title
      }));

      var $table = this.$el.find('.tbody');
      $table.html('');

      if (message) $table.append($('<div class="none-found">' + message + '</div>'));

      var tableRowView = this.row;

      // Append each model as a row
      this.collection.each(function(model) {
        var table_row = new tableRowView({ 
          model: model,
          parentView: self 
        });

        self.child_views.push(table_row);
        self.row_template = table_row.template;
        $table.append(table_row.$el);
      });

      if (this.collection.length < 1) return;
      
      if (this.options.totals) this.renderTotals();
    },

    renderFilters: function() {

      var self = this;

      var $fields = this.$el.find('.table-container .action-sort').each(function(i, $field) {
        var $sort_link = $($field);
        var $target = $sort_link.siblings('.action-filters');
        var field = $sort_link.attr('data-field-sort') || $sort_link.attr('data-field');
        var type = $sort_link.attr('data-filter-type');
        var $column = $sort_link.parent();
        
        var attrs_all = self.collection_backup.pluck(field);

        attrs_all = _.uniq(attrs_all).filter(function(x) {
          return typeof x !== 'undefined' && x !== '';
        });

        if (type == 'date_range') {
          self.filters[field] = {
            dates: []
          };
        } else {
          self.filters[field] = [];
        }
        
        var filterView = new FilterView({
          context: self,
          field: field,
          attrs_all: attrs_all,
          type: type
        });

        self.filterViews[field] = filterView;

        $column.append(filterView.$el);
      });
      
    },

    updateFilters: function(except) {
      for (var filterView in this.filterViews) {
        if (filterView == except) continue;

        // Get all unique attributes
        var attrs = this.collection.pluck(filterView);
        attrs = _.uniq(attrs).filter(function(x) {
          return typeof x !== 'undefined' && x !== '';
        });

        if (this.filterViews[filterView].type !== 'date_range') {
          this.filterViews[filterView].renderFilters(attrs);
        }
      }
    },

    renderTips: function() {
      var self = this;

      this.$el.removeClass('no-tips');

      var TipsView = app.View.TipsView;

      this.tips = new TipsView({
        selector: '.secondary',
        context: this.context
      });
    },

    showTips: function() {
      this.tips.show();
    },

    renderTotals: function() {
      var $totals_row = $('<div class="row totals" />');

      $totals_row.append(this.row_template(_.extend({ totals: 'TOTAL/AVG' }, this.context.totals(this))));

      this.$el.find('.tbody').append($totals_row);
    },

    renderDate: function() {
      var self = this;
      var $date_filter = this.$el.find('.date-filter');

      // Desktop - kalendae
      if (!app.utils.hasTouch()) {

        this.date_filter = new Kalendae.Input($date_filter[0], {
          months: 1,
          selected: moment()
        });

        this.date_filter.subscribe('change', function() {
          self.dateChange();
        });

      // Mobile - native date picker
      } else {
        $date_filter.attr('type', 'date').val(moment().format('YYYY-MM-DD'));
        $date_filter.on('change', function() {
          self.dateChange();
        });
      }
    },

    dateChange: function() {

      var $date_filter = this.$el.find('.date-filter');
      var date = $date_filter.val();

      // Desktop - kalendae
      if (!app.utils.hasTouch()) {
        // only continue if the field actually changed
        if (this.date_filter.getSelectedRaw().length === 0) return;
      }

      if (this.date === date) return; 

      this.collection.invoke('set', { today: date });

      this.renderTable();

      this.date = date;
    },

    sortCollection: function(event) {
      if (this.$el.find('.table').hasClass('editing')) this.render();

      app.utils.sortCollection(event, this);
    },

    searchCollection: function(event) {
      var query;
      query = this.$search_field.val();

      if (!query) {
        this.collection = this.collection_backup;
      } else {
        this.collection = this.collection_backup.search(query);
      }
      this.sortCollection();
    },

    filterCollection: function(except) {
      var filters = this.filters;

      // console.warn(_.isEmpty(filters));

      if (_.isEmpty(filters)) {
        this.collection = this.collection_backup;
      } else {
        this.collection = this.collection_backup.filters(filters);
      }
      this.sortCollection();
      this.updateFilters(except);
    },

    chosenFocus: function() {
      this.$el.find('.chosen-container input').focus();
    },

    filterHack: function(event) {
      event.preventDefault();
      var $target = $(event.currentTarget);
      var slaveTo = $target.attr('for');
      var $master = $('#' + slaveTo);
      var $field = $target.closest('.cell').children('.action-sort');
      var field = $field.attr('data-field-sort') || $field.attr('data-field');

      if ($master.prop('checked') === true) {
        $master.prop('checked', false);
      } else {
        $master.prop('checked', true);
      }

      this.filterViews[field].changeFilter({
        currentTarget: $master
      });
    },

    clickedFilter: function(event) {
      var $target = $(event.currentTarget);
      var field = $target.siblings('.action-sort').attr('data-field');
      var $column = this.$el.find('.table-container a[data-field="' + field + '"]').parent();

      if (!$column.hasClass('filters-active')) {
        this.showFilters(event);
      } else {
        this.hideFilters(event);
      }
    },

    showFilters: function(event) {
      var $target = $(event.currentTarget);
      var $sort_link = $target.siblings('.action-sort');
      var field = $sort_link.attr('data-field');
      var $column = this.$el.find('.table-container a[data-field="' + field + '"]').parent();

      $column.addClass('filters-active');
    },

    hideFilters: function(event) {
      var $target = $(event.currentTarget);
      var $sort_link = $target.siblings('.action-sort');
      var field = $sort_link.attr('data-field');
      var $column = this.$el.find('.table-container a[data-field="' + field + '"]').parent();

      $column.removeClass('filters-active');
    },

    clearSearch: function() {
      this.removeTags();
      this.searchCollection();
    },

    clearFilters: function() {
      for (var filter in this.filters) {
        if (this.filters[filter].dates) {
          this.filterViews[filter].render();
        } else {
          this.filters[filter] = [];
        }
      }

      this.$el.find('.has-filters').removeClass('has-filters');
      this.filterCollection();

      if (this.options.date) {
        // Reset date filter
        if (app.utils.isMobile()) {
          this.$el.find('.date-filter').val(moment.utc().format('YYYY-MM-DD'));
        } else {
          this.date_filter.setSelected(moment.utc());
        }
        this.dateChange();
      }
    },

    hideTertiary: function() {
      if (app.views.modelView || app.views.unitsView) app.controls.hideTertiary();
    },

    addModel: function() {
      var Modal = this.options.add;

      if (Modal) {
        var options = { context: this };
        _.extend(options, this.options.addModalOptions);
        this.modal = new Modal(options);
      }
    },

    modelAdded: function() {
      this.context.initialize();
    }

  });
});