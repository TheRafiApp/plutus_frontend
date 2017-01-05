define(["app","model/leases/LeaseModel"],function(e,t){var a=t.extend({urlRoot:function(){var t=e.utils.stash.getItem("activation"),a=t?"tenants/activate":"account";return e.API()+a+"/leases/"}});return a});
//# sourceMappingURL=MyLeaseModel.js.map
