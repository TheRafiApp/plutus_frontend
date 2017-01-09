define(["app","view/events/EventsView","text!templates/dashboard/admin.html"],function(e,t,n){return Backbone.View.extend({className:"scroll-y",template:_.template(n),initialize:function(){this.render()},render:function(){return this.$el.html(this.template({account:e.session.user.toJSON(),tasks:this.tasks})),this.$el.append((new t).$el),this}})});
//# sourceMappingURL=admin.js.map
