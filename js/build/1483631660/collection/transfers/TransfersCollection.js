define(["app","model/transfers/TransferModel"],function(t,i){return t.Collection.extend({idAttribute:"id",model:i,initialize:function(t,i){i||(i={}),this.options||(this.options={}),this.options=_.extend(this.options,i),this.options.base||(this.options.base="")},url:function(){return t.API()+this.options.base+"transfers/"}})});
//# sourceMappingURL=TransfersCollection.js.map
