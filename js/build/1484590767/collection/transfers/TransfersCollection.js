define(["app","model/transfers/TransferModel"],function(t,s){return t.Collection.extend({idAttribute:"id",model:s,initialize:function(t,s){s||(s={}),this.options||(this.options={}),this.options=_.extend(this.options,s),this.on("sync",this.reverse,this),this.options.base||(this.options.base="")},url:function(){return t.API()+this.options.base+"transfers/"},reverse:function(){this.models=this.models.reverse()}})});
//# sourceMappingURL=TransfersCollection.js.map
