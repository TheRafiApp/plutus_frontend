define(["app","model/properties/PropertyModel","collection/properties/UnitsCollection","view/tables/TableUnitView","view/modals/ModalUnitView","view/modals/ModalPropertyView","text!templates/tables/table-container-collection-units.html","text!templates/tables/table-collection-headers.html","text!templates/tables/table-units.html"],function(e,t,i,n,s,l,o,a,r){return Backbone.View.extend({className:"collection-view table-view",events:{"click .action-add":"addUnit","click .action-edit":"editProperty","click .action-save":"promptSave","click .action-delete":"promptDelete","click .sub-header-target":"hideQuarternary","click .action-back":"hideTertiary","click .action-show-tips":"showTips","click .action-sort":"sortCollection","keyup .search-field":"searchCollection","search .search-field":"searchCollection"},tips:["Proin quis hendrerit justo, a vehicula nulla. Proin vulputate facilisis turpis ut lobortis. Proin molestie mattis justo eget posuere. Duis sed odio feugiat, interdum diam sed","Ut tincidunt metus vel libero cursus pellentesque. Sed tincidunt, turpis ac efficitur egestas, tellus nibh iaculis purus, in aliquam elit eros nec elit.",{header:"Writing emails",body:"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque efficitur, dui ut fringilla placerat, enim arcu lacinia odio, at dictum risus purus vitae ante.",link:"http://google.com"},"Sed tempus, eros et tempus egestas, sem diam iaculis nisl, ac ultricies lacus nunc sit amet nisl. Suspendisse lectus nulla, rhoncus non mauris nec, varius consequat felis."],template:_.template(r),template_header:_.template(a),template_container:_.template(o),attachEvents:function(){this.on("batchSave",this.batchSave,this),this.on("confirmDelete",this.deleteModel,this),this.on("modalClosed",this.clearModal,this),this.on("unitAdded",this.modelAdded,this),this.on("unitEdited",this.refresh,this),this.renderTips(),this.listening=!0},refresh:function(){e.views.currentView.initialize(),this.initialize()},modelAdded:function(){this.refresh(),e.alerts.success("Unit added successfully")},initialize:function(n){n&&_.extend(this,n);var s=this;this.parentModel=new t({_id:this.parentModelId}),this.model=this.parentModel,this.parentModel.fetch().then(function(){s.collection=new i(null,{parentModelId:s.parentModelId}),s.collection.fetch().then(function(e){s.collection_backup=s.collection.clone(),e&&e.error?e.error.indexOf("not_found")>-1&&s.render():s.render()},function(t){e.alerts.error(t.responseJSON.message)})},function(t){e.alerts.error(t.responseJSON.message)})},render:function(){this.listening||this.attachEvents(),this.queue=[];this.$el.html(this.template_container()),this.$el.find(".table-container").html(this.template()),this.renderTable();var t=this.$el.find(".table").clone();return this.$el.find(".sub-header").html(t),e.views.currentView.$el.find('.row[data-id="'+this.parentModelId+'"]').addClass("selected"),e.views.unitView&&this.$el.find('.table-container .row[data-id="'+e.views.unitView._id+'"]').addClass("selected"),$(".tertiary").removeClass("loading"),this},renderTable:function(){var t=this,i=this.parentModel,s=!1;this.collection.length<1&&(s="No units found");var l={property:i.get("name")||i.get("address"),model:"Unit",count:this.collection.length};this.modelPlural&&(l.model_plural=e.utils.capitalize(this.modelPlural)),this.$el.find(".meta").html(this.template_header({header:l,title:this.title}));var o=this.$el.find(".tbody");o.html(""),s&&o.append($('<div class="none-found">'+s+"</div>")),this.collection.each(function(e){var i=new n({model:e,parentView:t,parentModel:t.parentModel});o.append(i.$el)})},renderTips:function(){var t=e.View.TipsView;this.tips=new t({selector:".tertiary",context:this})},showTips:function(){this.tips.show()},toggleEdit:function(){var e=this.$el.find(".action-edit"),t=e.parent().parent(),i=this.$el.find(".table");i.hasClass("editing")?(t.removeClass("editing"),i.removeClass("editing"),i.find("input").prop("disabled",!0)):(t.addClass("editing"),i.addClass("editing"),i.find("input").prop("disabled",!1))},cancelEdit:function(){this.render()},constructData:function(){var e=[];return _.each(this.child_views,function(t){var i={},n=t.$el.find("input");$.each(n,function(e){var t=$(n[e]).attr("name"),s=$(n[e]).val();i[t]=s}),e.push(i)}),e},sortCollection:function(t){this.$el.find(".table").hasClass("editing")&&this.render(),e.utils.sortCollection(t,this)},searchCollection:function(e){var t=$(e.target).val();t?this.collection=this.collection_backup.search(t):this.collection=this.collection_backup,this.sortCollection()},addUnit:function(){this.modal=new s({action:"add",eventName:"unitAdded",context:this})},editProperty:function(){this.modal=new l({action:"edit",model:this.parentModel,eventName:"unitEdited",context:this})},promptDelete:function(){var t=this.model.get("address"),i="Are you sure you want to delete "+t+"?";e.controls.modalConfirm(i,"confirmDelete",this)},promptSave:function(){var t="You have made changes to multiple units. Are you sure you want to save your changes?";e.controls.modalConfirm(t,"batchSave",this)},deleteModel:function(t,i){var n=this,s=$.Deferred();return this.model.destroy().then(function(){var t=e.router.getRoute();e.router.navigate(t,{trigger:!0}),s.resolve()}).fail(function(t){i||e.controls.handleError(t,null,n,"deleteModel"),s.reject(t)}),s},clearModal:function(){delete this.modal},hideQuarternary:function(){e.views.unitView&&e.controls.hideQuarternary({trigger:!0})},hideTertiary:function(){e.controls.hideTertiary()}})});
//# sourceMappingURL=UnitsView.js.map