define(["app","view/modals/ModalView","model/admin/WebhookModel","text!templates/modals/modal-webhook.html"],function(e,t,i,n){return t.extend({title:function(){return this.action+" Webhook"},template:_.template(n),initialize:function(e){e&&_.extend(this,e),this.model=new i,this.renderModalView()},render:function(){return this.ready(),this}})});
//# sourceMappingURL=ModalWebhookView.js.map
