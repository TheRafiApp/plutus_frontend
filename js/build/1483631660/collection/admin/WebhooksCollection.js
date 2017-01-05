define(["app","model/admin/WebhookModel"],function(i,n){return Backbone.Collection.extend({idAttribute:"id",model:n,url:function(){return i.API()+"dwolla/subscriptions"},initialize:function(i,n){return this}})});
//# sourceMappingURL=WebhooksCollection.js.map
