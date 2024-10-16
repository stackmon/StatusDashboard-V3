(function(_){for(var r in _){_[r].__farm_resource_pot__='scale-telekom-header-data-back-compat.entry_3e76.js';window['48f482be4dd400a82c616a2a754e954c'].__farm_module_system__.register(r,_[r])}})({"d2bf569b":/**
 * @license
 * Scale https://github.com/telekom/scale
 *
 * Copyright (c) 2021 Egor Kirpichev and contributors, Deutsche Telekom AG
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */function e(e,l,n,t){e._m(l),e.o(l,"a",()=>r),e.o(l,"f",()=>d);let d=(e=[],l,n)=>e.reduce((e,t)=>t.id===l?{selected:t,parent:n}:t.children&&t.children.length&&d(t.children,l,t).selected?d(t.children,l,t):e,{selected:null,parent:null}),r=(e,l)=>{let n=d(e,l);for(;n.parent;)n=d(e,n.parent.id);return n.selected;};},});