define(["app","model/users/TenantModel"],function(n,t){return n.Collection.extend({model:t,url:function(){var t=this.options.action?this.options.action:"";return n.API()+"tenants/"+t}})});
//# sourceMappingURL=TenantsCollection.js.map
