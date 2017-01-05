define(["app","model/users/UserModel"],function(t,n){var i=n.extend({name:"account",initialize:function(t,n){n||(n={}),this.options||(this.options={}),_.extend(this.options,n),this.options.action||(this.options.action="")},url:function(){return t.API()+"account/"+this.options.action}});return i});
//# sourceMappingURL=AccountModel.js.map
