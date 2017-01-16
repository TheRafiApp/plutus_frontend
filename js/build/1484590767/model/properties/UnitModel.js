define(["app"],function(t){var e=t.Model.extend({name:"unit",displayName:"number_pretty",urlRoot:function(){return t.API()+"properties/"+this.options.parentModelId+"/units"},schema:{rent:{type:"money"}},filters:["full_address","sq_ft_int","rent_pretty","number_pretty"],number_pretty:Backbone.computed("number",function(){var t=this.get("number");if(t)return/^[\d]/.test(t)&&(t="#"+t),t}),rent_pretty:Backbone.computed("rent",function(){var e=this.get("rent");if(e)return t.utils.prettyMoney(e)}),sq_ft_int:Backbone.computed("sq_ft",function(){var t=this.get("sq_ft");if(t)return parseFloat(t)}),full_address:Backbone.computed("number_pretty","property",function(){var e=this.get("property");if(e&&"string"!=typeof e){var r=e.country?", "+e.country:"";return e.address+" #"+this.get("number_pretty")+", "+e.city+", "+t.utils.stateAbbr(e.state)+" "+e.zip+r}}),validation:{number:{required:!0},property:{required:!0},beds:function(t,e,r){var n=t%1;if(isNaN(n)||n!==n)return"Please enter a valid number"},baths:function(t,e,r){var n=t%1;if(isNaN(n)||n!==n)return"Please enter a valid number"},rent:function(e,r,n){if("undefined"!=typeof e)return t.utils.validateMoney(e)}}});return e});
//# sourceMappingURL=UnitModel.js.map