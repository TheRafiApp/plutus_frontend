define(["app","model/users/UserModel"],function(n,o){var t=o.extend({name:"admin",urlRoot:function(){var o="";return this.options.action&&(o=this.options.action),n.API()+"admins/"+o}});return t});
//# sourceMappingURL=AdminModel.js.map
