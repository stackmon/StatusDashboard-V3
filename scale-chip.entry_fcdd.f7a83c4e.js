(function(_){for(var r in _){_[r].__farm_resource_pot__='scale-chip.entry_fcdd.js';window['48f482be4dd400a82c616a2a754e954c'].__farm_module_system__.register(r,_[r])}})({"af88fe80":/**
 * @license
 * Scale https://github.com/telekom/scale
 *
 * Copyright (c) 2021 Egor Kirpichev and contributors, Deutsche Telekom AG
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */function e(e,t,o,n){e._m(t),e.o(t,"a",()=>h),e.o(t,"b",()=>i),e.o(t,"c",()=>l),e.o(t,"e",()=>r),e.o(t,"g",()=>s),e.o(t,"h",()=>u),e.o(t,"i",()=>d);let u=e=>!!e.shadowRoot&&!!e.attachShadow,l=e=>{let t=document.styleSheets[0];if(!t){let e=document.createElement("style");document.head.appendChild(e),t=document.styleSheets[0],document.head.removeChild(e);}return function(){try{return/^:/.test(e)||(e=":"+e),t.insertRule("html"+e+"{}",0),t.deleteRule(0),!0;}catch(e){return!1;}}();};function r(e,t,o){let n=t+"Legacy",u=[];return void 0!==e[n]&&u.push(e[n].emit(o)),u.push(e[t].emit(o)),u;}function i(e,t){let o=e.target,n=null!=o.shadowRoot,u=n?e.composedPath():[];do{if(o===t)return!1;o=n?u.shift():o.parentNode;}while(o)return!0;}let d=e=>null!=e&&1===e.nodeType&&"SCALE-ICON"===e.nodeName.toUpperCase().substring(0,10),a=0;function s(){return a++;}let h=e=>Promise.all(e.getAnimations({subtree:!0}).map(e=>e.finished));},});