/**
 * WebhooksView.js
 */

define([
  'app',
  'view/WebhookView',
  'view/modals/ModalWebhookView',
  'collection/admin/WebhooksCollection',
  'text!templates/webhooks/webhooks.html'
],
function(app, WebhookView, ModalWebhookView, WebhooksCollection, WebhooksTemplate) {

  return Backbone.View.extend({

    className: 'panel loading',

    events: {
      'click .action-add': 'addWebhook',
      // 'click .action-cancel': 'toggleAddForm'
    },

    initialize: function() {
      var self = this;
      this.template = _.template(WebhooksTemplate);

      this.on('addModel', this.initialize, this);

      this.collection = new WebhooksCollection();
      this.collection.fetch().then(function() {
        self.render();
      }, function() {
        console.warn(arguments)
        self.render();
      });
      
    },

    render: function() {
      var self = this;

      this.$el.html(this.template());

      this.collection.each(function(model) {
        self.$el.find('.webhooks').append(new WebhookView({ 
          model: model,
          parentView: self
        }).$el);
      });

      // this.$el.find('.scroll-y').append(new WebhookAddView({
      //   parentView: this
      // }).$el);

      this.$el.removeClass('loading');

      return this;
    },

    addWebhook: function() {
      this.modal = new ModalWebhookView({
        action: 'add',
        eventName: 'addModel',
        context: this
      });
    },

    // toggleAddForm: function() {
    //   var $form = this.$el.find('form.add-model');
    //   var $btn = this.$el.find('.action-add');
    //   var $cancel = this.$el.find('.action-cancel');

    //   if ($form.hasClass('hidden')) {
    //     $form.removeClass('hidden');
    //     $btn.addClass('hidden');
    //     $cancel.removeClass('hidden');
    //   } else {
    //     $form.addClass('hidden');
    //     $btn.removeClass('hidden');
    //     $cancel.addClass('hidden');
    //   }
    // }

  });
});