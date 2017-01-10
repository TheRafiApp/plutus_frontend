define(["app","view/modals/ModalView","text!templates/modals/modal-contact.html"],function(t,e,i){return e.extend({className:"user",events:{"change input.contact":"validateContact"},template:_.template(i),title:function(){var e=t.utils.capitalize(this.action),i=t.utils.capitalize(this.method);return e+" "+i},initialize:function(e){e&&_.extend(this,e);var i=this.context.model.toJSON(),n=t.models.AccountModel;this.model=new n(i,{action:this.method}),this.renderModalView()},render:function(){var t,e=this.context.model.get("notifications."+[this.method]);return"phone"===this.method?t=this.context.model.get("phone"):"email"===this.method&&(t=this.context.model.get("email")),this.ready({action:this.action,method:this.method,contact:t,notify:e}),this.$el.find(".code").mask("ZZZ–ZZZ",{translation:{Z:{pattern:/[A-Za-z0-9]/}}}),this.$el.find(".modal").addClass("start"),"verify"===this.action&&(this.$el.find(".modal").removeClass("start").addClass("sent"),this.$el.find("input.contact").prop("disabled",!0)),this},confirm:function(){this.$el.find(".modal").hasClass("start")?this.submitContact():this.$el.find(".modal").hasClass("sent")&&this.verifyContact()},constructData:function(){var e=this.validateContact();if(e){var i=(this.model.clone(),!!this.$el.find("#notifications").is(":checked")),n=e;return n.notifications={},n.notifications[this.method]=i,t.schema.process(n,this.model)}},validateContact:function(){var e=this.$el.find("input.contact"),i=t.utils.validateContact(e.val(),!0);return i?(this.$el.find(".contact-display").text(e.val()),i):(t.controls.fieldError({element:e,error:"Please enter valid contact data"}),!1)},submitContact:function(){var e=this,i=this.constructData();if(i){var n=i[this.method],a=this.model.toJSON();a.authentication&&n!==a.authentication[this.method]&&n===a[this.method]&&this.model.unset(this.method),t.controls.loadLock(!0),this.model.save(i).always(function(){t.controls.loadLock(!1)}).then(function(i){var n="";"authentication_request_sent"===i.action?(n="Thanks, we sent you a",n+="phone"===e.method?" text message":"n email",n+=" with a verification code."):n+="Thank you, your contact preferences have been updated.",t.alerts.success(n),e.$el.find(".modal").removeClass("start").addClass("sent"),e.$el.find("input.contact").prop("disabled",!0)}).fail(function(e){t.controls.handleError(e)})}},verifyContact:function(){var e=this,i=$.trim(this.$el.find(".code").val().toUpperCase()),n=this.$el.find("input.contact"),a=t.utils.validateContact(n.val(),!0);a.code=i,t.session.verifyCode(a).then(function(i){e.closeModal(),t.views.currentView.currentTab.initialize({refresh:!0}),t.alerts.success("Your contact information has been verified!")}).fail(function(){t.alerts.error("Something went wrong")})}})});
//# sourceMappingURL=ModalContactView.js.map