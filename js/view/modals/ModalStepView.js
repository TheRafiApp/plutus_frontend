/**
 * modals/ModalStepView.js
 */

define([
  'app'
],
function(
  app
) {

  return Backbone.View.extend({

    className: 'step',

    initialize: function(_options) {
      if (_options) _.extend(this, _options);

      var self = this;

      this.render = _.wrap(this.render, function(render) { 
        var boundRender = render.bind(self);
        self.afterInit();
        self.beforeRenderOnce();
        self.beforeRender(); 
        boundRender(); 
        self.afterRender(); 
        return self; 
      });

      return this;
    },

    afterInit: function() {},
    beforeRender: function() {},
    beforeRenderOnce: function() {
      if (!this.initialized) {
        this.attachEvents();
        if (this.model) Backbone.Validation.bind(this);
        this.initialized = true;
        this.new_models = [];
      }
    },
    render: function() {
      this.$el.html(this.template());
      return this;
    },
    afterRender: function() {},
    setData: function() {},

    attachEvents: function() {
      if (!this.listening) {
        this.on('next', this.next, this);
        this.listening = true;
      }
    },

    show: function() {
      this.$el.addClass('active');

      this.beforeRender();

      if (!this.initialized) this.render();

      this.afterShow();
    },

    afterShow: function() {},

    success: function() {
      $('.modal').addClass('loading success');

      var self = this;

      app.controls.wait(1200).then(function() {
        $('.modal').removeClass('loading success');
        self.nextStep();
      });
    },

    beforeNextStep: function() {},

    nextStep: function() {
      this.beforeNextStep();
      this.parentView.nextStep();
    },

    constructData: function() {
      var data = this.$el.find('form').serializeObject();
      if (this.model) {
        return app.schema.process(data, this.model);
      } else {
        return data;
      }
    },

    validate: function() {
      var self = this;

      var promise = app.utils.promises(1)[0];

      var data = this.constructData();

      console.log(data);
      
      if (this.model) {
        validate = app.utils.validate(this, data);
        if (validate) promise = this.validateOnServer(data);
      } else {
        if (validate) {
          promise.resolve();
        } else {
          promise.reject();
        }
      }

      return promise;
    },

    validateOnServer: function(data) {
      return this.model.validateOnServer(data, this.validationType);
    },

    next: function() {
      var self = this;

      var validate = this.validate().then(function() {
        var data = self.constructData();
        self.setData(data);
      });
    },

    lock: function() {
      this.parentView.lock();
    },

    unlock: function() {
      this.parentView.unlock();
    }

  });
});