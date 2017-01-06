define(["app","model/properties/UnitModel"],function(e,n){return e.Collection.extend({model:n,url:function(){return e.API()+"properties/"+this.options.parentModelId+"/units"}})});
//# sourceMappingURL=UnitsCollection.js.map
