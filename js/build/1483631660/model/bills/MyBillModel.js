define(["app","model/bills/BillModel"],function(e,n){return n.extend({urlRoot:function(){return e.API()+"account/bills"},schema:{amount:{type:"money"}},validation:{amount:function(e,n,t){return e?+e>+t.total?"You have entered an amount that exceeds the balance of the bill.":void 0:"Please enter an amount."}}})});
//# sourceMappingURL=MyBillModel.js.map
