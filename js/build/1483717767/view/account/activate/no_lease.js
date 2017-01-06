define(["app","text!templates/account/activate/no_lease.html"],function(e,t){return Backbone.View.extend({className:"no_lease",template:_.template(t),initialize:function(e){e&&_.extend(this,e),this.render()},render:function(){return this.$el.html(this.template({logo:e.templates.logo(),user:this.parentView.user.toJSON()})),this}})});
//# sourceMappingURL=no_lease.js.map
