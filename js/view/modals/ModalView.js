/**
 * ModalView.js
 */

define([
  'app',
  'text!templates/modals/modal.html'
],
function(app, ModalTemplate) {

  return Backbone.View.extend({

    // default events
    'modalEvents': {
      'keyup': 'keyControl',
      'click .action-confirm': 'confirm',
      'click .action-cancel': 'closeModal',
      'click .overlay': 'closeModal',
      'submit form': 'handleSubmit'
    },

    // outer modal template
    template_container: _.template(ModalTemplate),

    // default actions to allow
    actions: {
      confirm: true,
      cancel: true
    },

    // default messages
    messages: {
      success: 'Your changes have been saved',
      error: 'Your changes could not be saved'
    },

    initialize: function(options) {
      if (_options) _.extend(this, _options);

      this.options = _.extend(this.actions, this.options);

      this.app.views.appView && this.app.views.appView.trigger('modalOpened');
      this.app.views.modalView = this;
    },

    // default keyboard usage
    keyControl: function(e) {
      var $focused = app.utils.getFocused();

      // esc
      if (e.which === 27) {
        if ($focused.className.contains('no-escape')) return;

        this.closeModal();
      // enter
      } else if (e.which === 13) {
        
        if ($focused.parentNode.className.contains('actions')) return;
        if ($focused.className.contains('no-submit')) return;

        this.confirm(e);
      }
    },

    // extend these events with any that were defined in the view
    attachEvents: function() {
      var events = _.extend(this.modalEvents, this.events);
      this.delegateEvents(events);

      // this.listening = true;
    },

    // this should be fired at the end of initialize
    renderModalView: function(_options) {
      if (_options) _.extend(this, _options);

      if (app.views.appView) app.views.appView.trigger('modalOpened');
      app.views.modalView = this;

      this.renderContainer();
    },

    // render outer container
    renderContainer: function() {
      var self = this;

      var title = typeof this.title === 'function' ? this.title() : this.title;

      this.$el.html(this.template_container({
        title: title,
        actions: this.actions, 
      }));

      if (this.tabs) this.renderTabs();

      this.render();
      
      this.attachEvents();

      return this;
    },

    renderTabs: function() {
      var self = this;
      var count = 0;
      var $container = $('<ul class="tabs">');
      _.each(this.tabs, function(value, key, array) {
        var $li = $('<li>');
        var $a = $('<a>', {
          'href': '#',
          'data-tab': key
        }).html(value);

        if (count++ === 0) $a.addClass('active');

        $li.append($a);
        $container.append($li);
      });

      this.$el.find('.content').prepend($container);
    },

    // add this.$el to DOM and 
    // delegate events
    ready: function(data) {
      if (this.model) Backbone.Validation.bind(this);

      this.$el.find('.form-model').html(this.template(data));
      $('.modal-container').html(this.$el).addClass('visible');
      app.utils.prepInputs(this);

      if (this.$el.find('.focus').length < 1) 
        this.$el.find('.actions a:last-child').focus();
    },

    // close the modal
    closeModal: function(e) {
      $('.modal-container').removeClass('visible');
      this.close();
      this.context.trigger('modalClosed');
      if (app.views.appView) app.views.appView.trigger('modalClosed');
    },

    easyClose: function() {
      if (!this.changed()) {
        this.closeModal();
      } else {
        app.controls.modalShake(this);
      }
    },

    handleSubmit: function(e) {
      e.preventDefault();
    },

    // default method to get form data
    constructData: function() {
      var $form = this.$el.find('form');
      var formData = $form.serializeObject();

      return app.schema.process(formData, this.model);
    },

    // default confirmation
    confirm: function(event) {
      if (event && $(event.currentTarget).hasClass('disabled')) return;

      var self = this;

      var formData = this.constructData();

      if (!app.utils.validate(this, formData)) return false;

      app.controls.loadLock(true);

      this.model.save(formData).always(function() {
        app.controls.loadLock(false);
      }).then(function() {
        self.context.trigger(self.eventName);
        self.closeModal();
        app.alerts.success(self.messages.success);
      }).fail(function(error) {
        self.handleError(error);
      });
    },

    lock: function() {
      this.$el.find('.content').addClass('loading');
    },

    unlock: function() {
      this.$el.find('.content').removeClass('loading');
    },

    // allow for different error handling per modal
    handleError: function(error) {
      return app.controls.handleError(error);
    }

  });
});