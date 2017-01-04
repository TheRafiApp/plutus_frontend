/**
 * UnitsView.js
 */

define([
  'app',
  'model/properties/PropertyModel',
  'collection/properties/UnitsCollection',
  'view/tables/TableUnitView',
  'view/modals/ModalUnitView',
  'view/modals/ModalPropertyView',
  'text!templates/tables/table-container-collection-units.html',
  'text!templates/tables/table-collection-headers.html',
  'text!templates/tables/table-units.html',
],
function(
  app, 
  PropertyModel, 
  UnitsCollection, 
  TableUnitView, 
  ModalUnitView, 
  ModalPropertyView, 
  TableContainerTemplate, 
  TableCollectionHeader, 
  TableUnitTemplate
  ) {

  return Backbone.View.extend({

    className: 'collection-view table-view',

    events: {
      'click .action-add': 'addUnit',
      'click .action-edit': 'editProperty',
      'click .action-save': 'promptSave',
      'click .action-delete': 'promptDelete',
      'click .sub-header-target': 'hideQuarternary',
      'click .action-back': 'hideTertiary',
      'click .action-show-tips': 'showTips',
      'click .action-sort': 'sortCollection',
      'keyup .search-field': 'searchCollection',
      'search .search-field': 'searchCollection',
    },

    tips: [
      'Proin quis hendrerit justo, a vehicula nulla. Proin vulputate facilisis turpis ut lobortis. Proin molestie mattis justo eget posuere. Duis sed odio feugiat, interdum diam sed',
      'Ut tincidunt metus vel libero cursus pellentesque. Sed tincidunt, turpis ac efficitur egestas, tellus nibh iaculis purus, in aliquam elit eros nec elit.',
      { 
        'header': 'Writing emails',
        'body': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque efficitur, dui ut fringilla placerat, enim arcu lacinia odio, at dictum risus purus vitae ante.',
        'link': 'http://google.com'
      },
      'Sed tempus, eros et tempus egestas, sem diam iaculis nisl, ac ultricies lacus nunc sit amet nisl. Suspendisse lectus nulla, rhoncus non mauris nec, varius consequat felis.'
    ],


    template: _.template(TableUnitTemplate),
    template_header: _.template(TableCollectionHeader),
    template_container: _.template(TableContainerTemplate),

    attachEvents: function() {
      this.on('batchSave', this.batchSave, this);
      this.on('confirmDelete', this.deleteModel, this);
      this.on('modalClosed', this.clearModal, this);
      this.on('unitAdded', this.modelAdded, this);
      this.on('unitEdited', this.refresh, this);

      this.renderTips();

      this.listening = true;
    },

    refresh: function() {
      app.views.currentView.initialize();
      this.initialize();
    },

    modelAdded: function() {
      this.refresh();
      app.alerts.success('Unit added successfully');
    },

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.parentModel = new PropertyModel({
        _id: this.parentModelId
      });

      this.model = this.parentModel;

      this.parentModel.fetch().then(function() {
        self.collection = new UnitsCollection(null, {
          parentModelId: self.parentModelId
        });
        self.collection.fetch().then(function(response) {
          self.collection_backup = self.collection.clone();

          if (response && response.error) {
            if (response.error.indexOf('not_found') > -1) {
              self.render();
            }
          } else {
            self.render();
          }
        }, function(error) {
          app.alerts.error(error.responseJSON.message);
        });
      }, function(error) {
        app.alerts.error(error.responseJSON.message);
      });

    },

    render: function() {
      if (!this.listening) this.attachEvents();
      this.queue = [];

      var self = this;

      // Build the table
      this.$el.html(this.template_container());
      this.$el.find('.table-container').html(this.template());

      this.renderTable();

      var clone = this.$el.find('.table').clone();

      // Fixed header hack
      this.$el.find('.sub-header').html(clone);

      app.views.currentView.$el.find('.row[data-id="' + this.parentModelId + '"]').addClass('selected');

      if (app.views.unitView) {
        this.$el.find('.table-container .row[data-id="' + app.views.unitView._id + '"]').addClass('selected');
      }

      $('.tertiary').removeClass('loading');

      return this;
    },

    renderTable: function() {
      var self = this;
      var property = this.parentModel;
      var message = false;

      if (this.collection.length < 1) message = 'No units found';

      var header_info = {
        property: property.get('name') || property.get('address'),
        model: 'Unit',
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

      this.collection.each(function(unit) {

        var table_unit_view = new TableUnitView({
          model: unit,
          parentView: self,
          parentModel: self.parentModel
        });

        $table.append(table_unit_view.$el);
      });
    },

    renderTips: function() {
      var self = this;

      var TipsView = app.View.TipsView;

      this.tips = new TipsView({
        selector: '.tertiary',
        context: this
      });
    },

    showTips: function() {
      this.tips.show();
    },

    toggleEdit: function() {
      var $btn = this.$el.find('.action-edit');
      
      var $actions = $btn.parent().parent();
      var $table = this.$el.find('.table');

      if ($table.hasClass('editing')) {
        $actions.removeClass('editing');
        $table.removeClass('editing');
        $table.find('input').prop('disabled', true);
      } else {
        $actions.addClass('editing');
        $table.addClass('editing');
        $table.find('input').prop('disabled', false);
      }
    },

    cancelEdit: function() {
      this.render();
    },

    constructData: function() {
      var data = [];

      _.each(this.child_views, function($user_row) {
        var model = {};
        var $inputs = $user_row.$el.find('input');

        $.each($inputs, function(x) {
          var key = $($inputs[x]).attr('name');
          var value = $($inputs[x]).val();
          model[key] = value;
        });

        data.push(model);
      });

      return data;
    },

    sortCollection: function(event) {
      if (this.$el.find('.table').hasClass('editing')) this.render();

      app.utils.sortCollection(event, this);
    },

    searchCollection: function(event) {
      var query = $(event.target).val();
      if (!query) {
        this.collection = this.collection_backup;
      } else {
        this.collection = this.collection_backup.search(query);
      }
      this.sortCollection();
    },

    addUnit: function() {
      this.modal = new ModalUnitView({
        action: 'add',
        eventName: 'unitAdded',
        context: this
      });
    },

    editProperty: function() {
      this.modal = new ModalPropertyView({
        action: 'edit',
        model: this.parentModel,
        eventName: 'unitEdited',
        context: this
      });
    },

    promptDelete: function() {
      var target = this.model.get('address');
      var message = 'Are you sure you want to delete ' + target + '?';

      app.controls.modalConfirm(message, 'confirmDelete', this);
    },

    promptSave: function() {
      var message = 'You have made changes to multiple units. Are you sure you want to save your changes?';
      app.controls.modalConfirm(message, 'batchSave', this);
    },

    deleteModel: function(event, override) {
      var self = this;
      var promise = $.Deferred();

      this.model.destroy().then(function() {
        var route = app.router.getRoute();
        app.router.navigate(route, { trigger: true });

        promise.resolve();

      }).fail(function(error) {
        if (!override) app.controls.handleError(error, null, self, 'deleteModel');
        promise.reject(error);
      });

      return promise;
    },

    clearModal: function() {
      delete this.modal;
    },

    hideQuarternary: function() {
      if (app.views.unitView) {
        app.controls.hideQuarternary({
          trigger: true
        });
      }
    },

    hideTertiary: function() {
      app.controls.hideTertiary();
    },

  });
});