define(["app","model/bills/MyBillModel"],function(i,t){return i.Collection.extend({model:t,initialize:function(i){i||(i={}),this.options||(this.options={}),this.options=_.extend(this.options,i),this.suffix=this.options.active?"/active":""},url:function(){return i.API()+"account/bills"+this.suffix}})});
//# sourceMappingURL=MyBillsCollection.js.map
