define(["app","model/users/UserModel"],function(n,t){var e=t.extend({name:"tenant",urlRoot:function(){var t="";return this.options.action&&(t=this.options.action),n.API()+"tenants/"+t}});return e});
//# sourceMappingURL=TenantModel.js.map
