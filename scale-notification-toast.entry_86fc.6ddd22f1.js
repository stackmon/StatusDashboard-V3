(function(_){for(var r in _){_[r].__farm_resource_pot__='scale-notification-toast.entry_86fc.js';window['48f482be4dd400a82c616a2a754e954c'].__farm_module_system__.register(r,_[r])}})({"1902eb81":function t(t,i,o,a){t._m(i),t.o(i,"scale_notification_toast",()=>c);var n=o("93ebae3c"),s=o("07965720"),e=o("9ffbc686"),r=o("af88fe80");let c=class{constructor(t){n.r(this,t),this.scaleClosing=n.c(this,"scale-closing",7),this.scaleClose=n.c(this,"scale-close",7),this.variant="informational",this.animated=!0,this.alignment="top-right",this.positionVertical=12,this.positionHorizontal=12,this.autoHide=!1,this.autoHideDuration=3e3,this.fadeDuration=500,this.closeButtonLabel="close",this.closeButtonTitle="close",this.toastHeightWithOffset=0,this.hideToast=!1,this.close=()=>{r.e(this,"scaleClosing"),this.hideToast=!0,setTimeout(()=>{this.opened=!1,r.e(this,"scaleClose");},this.fadeDuration);},this.transitions=t=>`
      @keyframes fadeIn {
        from {
          opacity: 0;
          ${this.alignmentVertical}: -${t}px;
        }
        to {
          opacity: 1;
          ${this.alignmentVertical}: ${this.positionVertical}px;
        }
      }
  
      @keyframes fadeOut {
        from {
          opacity: 1;
          ${this.alignmentVertical}: ${this.positionVertical}px;
        }
        to {
          opacity: 0;
          ${this.alignmentVertical}: -${t}px;
        }
      }
    `,this.animationStyle=t=>this.animated?`
        .notification-toast--show {
          ${this.alignmentHorizontal}: ${this.positionHorizontal}px;
          animation: fadeIn ${this.fadeDuration/1e3}s ease-in-out;
          ${this.alignmentVertical}: ${this.positionVertical}px;
          opacity: 1;
        },
        .notification-toast--show {
          ${this.alignmentHorizontal}: ${this.positionHorizontal}px;
          animation: fadeOut ${this.fadeDuration/1e3}s ease-in-out;
          ${this.alignmentVertical}: -${t}px;
          opacity: 0;
        }
      `:`
    .notification-toast--show {
      ${this.alignmentHorizontal}: ${this.positionHorizontal}px;
      ${this.alignmentVertical}: ${this.positionVertical}px;
      opacity: 1;
    },
    .notification-toast--show {
      ${this.alignmentHorizontal}: ${this.positionHorizontal}px;
      ${this.alignmentVertical}: -${t}px;
      opacity: 0;
    }
  `;}connectedCallback(){e.s({source:this.element,type:"warn"});}componentWillLoad(){let t=this.alignment.split("-");this.alignmentVertical=t[0],this.alignmentHorizontal=t[1];}componentDidRender(){!0===this.autoHide&&setTimeout(this.close,this.autoHideDuration);}handleIcons(){if(this.variant)switch(this.variant){case"success":return n.h("scale-icon-action-success",{class:"notification-toast__icon",size:20,color:"#ffffff",selected:!0,"aria-hidden":"true"});case"informational":return n.h("scale-icon-alert-information",{class:"notification-toast__icon",size:20,selected:!0,color:"#ffffff","aria-hidden":"true"});case"error":return n.h("scale-icon-alert-error",{class:"notification-toast__icon",size:20,selected:!0,color:"#ffffff","aria-hidden":"true"});case"warning":return n.h("scale-icon-alert-warning",{class:"notification-toast__icon",color:"#ffff",size:20,selected:!0,"aria-hidden":"true"});}}async open(){this.opened=!0,this.hideToast=!1;}render(){if(this.opened)return n.h(n.a,null,this.styles&&n.h("style",null,this.styles),n.h("style",null,this.transitions(this.toastHeightWithOffset)),n.h("style",null,this.animationStyle(this.toastHeightWithOffset)),n.h("div",{role:"alert",style:{display:`${this.opened?"":"none"}`},class:this.getCssClassMap(),part:this.getBasePartMap(),tabindex:"0"},n.h("div",{class:"notification-toast__icon-container"},this.handleIcons()),n.h("div",{class:"notification-toast__text-container"},n.h("slot",{name:"header"}),n.h("slot",{name:"body"}),n.h("scale-link",{href:this.href,class:"notification-toast__link",role:"link"},n.h("slot",{name:"link"}))),n.h("button",{part:"button-dismissable",type:"button",class:"notification-toast__button-close",onClick:()=>this.close(),tabindex:0,"aria-label":this.closeButtonLabel,title:this.closeButtonTitle,onKeyDown:t=>{"Enter"===t.key&&this.close();}},n.h("scale-icon-action-circle-close",null))));}getToastHeightWithOffset(){let t=this.element.shadowRoot.querySelector(".toast").scrollHeight;this.toastHeightWithOffset=t+this.positionVertical;}getBasePartMap(){return this.getCssOrBasePartMap("basePart");}getCssClassMap(){return this.getCssOrBasePartMap("css");}getCssOrBasePartMap(t){let i="notification-toast",o="basePart"===t?"":`${i}`;return s.c("basePart"===t?"base":i,this.variant&&`${o}--variant-${this.variant}`,!!this.opened&&`${o}--opened`,!this.hideToast&&`${o}--show`,!!this.hideToast&&`${o}--hide`,this.story&&`${o}--story`);}get element(){return n.g(this);}};c.style=":host{--width:366px;--width-icon-container:48px;--radius:var(--telekom-radius-standard);--background:var(--telekom-color-background-surface);--z-index:100;--box-shadow:var(--telekom-shadow-raised-standard);--background-success-icon-container:var(\n    --telekom-color-functional-success-standard\n  );--background-warning-icon-container:var(\n    --telekom-color-functional-warning-standard\n  );--background-error-icon-container:var(\n    --telekom-color-functional-danger-standard\n  );--background-informational-icon-container:var(\n    --telekom-color-functional-informational-standard\n  );--background-success-text-container:var(\n    --telekom-color-functional-success-subtle\n  );--background-warning-text-container:var(\n    --telekom-color-functional-warning-subtle\n  );--background-error-text-container:var(\n    --telekom-color-functional-danger-subtle\n  );--background-informational-text-container:var(\n    --telekom-color-functional-informational-subtle\n  )}.notification-toast{width:calc(var(--width) - var(--width-icon-container));opacity:1;z-index:var(--z-index);position:fixed;background:var(--background);box-shadow:var(--box-shadow);box-sizing:border-box;border-radius:0 var(--radius) var(--radius) 0;flex-direction:column;justify-content:space-between}.notification-toast.notification-toast--story{position:absolute}.notification-toast.notification-toast--story.notification-toast--hide{opacity:0}.notification-toast.notification-toast--story.notification-toast--opened{opacity:1}.notification-toast.notification-toast--variant-success{background:var(--background-success-text-container)}.notification-toast.notification-toast--variant-warning{background:var(--background-warning-text-container)}.notification-toast.notification-toast--variant-error{background:var(--background-error-text-container)}.notification-toast.notification-toast--variant-informational{background:var(--background-informational-text-container)}.notification-toast__icon{position:absolute;top:50%;left:50%;margin:-10px 0 0 -10px}.notification-toast__icon-container{height:100%;width:var(--width-icon-container);position:absolute;left:calc(var(--width-icon-container) * -1 + 1px);top:0;float:left;border-radius:var(--radius) 0 0 var(--radius)}.notification-toast.notification-toast--variant-success .notification-toast__icon-container{background:var(--background-success-icon-container)}.notification-toast.notification-toast--variant-warning .notification-toast__icon-container{background:var(--background-warning-icon-container)}.notification-toast.notification-toast--variant-error .notification-toast__icon-container{background:var(--background-error-icon-container)}.notification-toast.notification-toast--variant-informational .notification-toast__icon-container{background:var(--background-informational-icon-container)}::slotted([slot='header']){margin:0;padding:3px var(--width-icon-container) 0 10px;font-weight:bold;font-size:16px}::slotted([slot='body']){padding:3px 0 0 10px;margin:0}::slotted([slot='link']){padding:10px 0 15px 10px;margin:0}.notification-toast__text-container{width:calc(var(--width) - calc(var(--width-icon-container) * 1));min-height:33px;float:left;position:relative;margin:0 0 0 1px;padding:15px 0 0 0}.notification-toast__button-close{position:absolute;top:10px;right:7.5px;color:#191919;border:none;cursor:pointer;margin:0;padding:0;background:transparent}.notification-toast__button-close svg{height:19px;width:19px;padding:7.5px 6.5px 6.5px 6.5px;border-radius:20%;color:var(--telekom-color-text-and-icon-standard)}.notification-toast__button-close:hover svg{background-color:white;color:var(--telekom-color-text-and-icon-primary-hovered)}@media screen and (forced-colors: active), (-ms-high-contrast: active){.notification-toast__button-close svg{color:hsl(0, 0%, 100%)}.notification-toast{border:1px solid hsl(0, 0%, 100%)}.notification-toast__icon-container{border:1px solid hsl(0, 0%, 100%);margin-top:-1px}}";},});