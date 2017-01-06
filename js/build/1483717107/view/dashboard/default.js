define(["app","text!templates/dashboard/default.html"],function(t,e){return Backbone.View.extend({className:"scroll-y",template:_.template(e),initialize:function(){this.render()},render:function(){return this.$el.html(this.template({account:t.session.user.toJSON(),tasks:this.tasks})),this}})});
//# sourceMappingURL=default.js.map
