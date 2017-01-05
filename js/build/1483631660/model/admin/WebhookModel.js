define(["app"],function(n){var e=Backbone.Model.extend({name:"funding source",displayName:"url",urlRoot:function(){return n.API()+"dwolla/subscriptions"},validation:{url:{pattern:"url"}}});return e});
//# sourceMappingURL=WebhookModel.js.map
