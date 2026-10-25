import {TYPES,SCENARIOS,SHAPE_NAMES,SHAPES,createState,scenarioOf,bouquet,score,act,validState,flowerSVG,arrangementSVG} from './engine.js';
const $=s=>document.querySelector(s),KEY='market-bouquet-v1';
let saves={},current='morning',history=[],guides=true,toastTimer;
try{const cached=JSON.parse(localStorage.getItem(KEY)||'null');if(cached&&cached.saves){for(const [id,s] of Object.entries(cached.saves))if(validState(s)&&s.scenario===id)saves[id]=s;if(SCENARIOS.some(x=>x.id===cached.current))current=cached.current;}}catch{}
let state=saves[current]||createState(current);
function save(){saves[current]=state;try{localStorage.setItem(KEY,JSON.stringify({current,saves}));}catch{}}
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),2600);}
function dispatch(action){try{const next=act(state,action);if(!['select','active'].includes(action.type)){history.push(state);if(history.length>100)history.shift();}state=next;save();render();if(action.type==='trim')toast('已经剪短。取下也不会变长，撤销可以恢复。');if(action.type==='recycle')toast('剪余变成了装饰，也换回一枚零钱。');if(action.type==='seal')toast('蝴蝶结系好了。这份心意已经交付。');}catch(e){toast(e.message);}}
function switchScenario(id){saves[current]=state;current=id;state=saves[id]||createState(id);history=[];save();render();}
function icon(t){return `<svg viewBox="0 0 90 95" aria-hidden="true"><path d="M45 89 Q41 67 45 38" stroke="#7c8c64" stroke-width="1.8" fill="none"/><path d="M44 70 q-20 -18 -22 -4 q12 13 22 4" fill="#9caa82"/>${flowerSVG(t,45,35,.7)}</svg>`;}
function render(){const sc=scenarioOf(state),client=sc.clients.find(x=>x.id===state.active),s=score(state),flowers=bouquet(state),selected=state.stems.find(x=>x.id===state.selected),locked=state.sealed.includes(state.active),free=state.scenario==='free';
 $('#scenarios').innerHTML=SCENARIOS.map((x,i)=>`<button data-scenario="${x.id}" aria-current="${x.id===current}"><span>${i===3?'✳':String(i+1).padStart(2,'0')}</span>${x.name}</button>`).join('');
 $('#day-title').textContent=sc.weather;$('#day-subtitle').textContent=sc.subtitle;
 $('#commissions').innerHTML=sc.clients.map((c,i)=>{const r=score(state,c.id);return `<button class="commission ${state.active===c.id?'active':''}" data-order="${c.id}" aria-pressed="${state.active===c.id}"><div class="commission-head"><h3>${c.name}</h3><span class="commission-index">ORDER 0${i+1}</span></div><p>${c.note}</p><div class="commission-meta"><span class="color-dots">${c.hues.map(h=>`<i style="background:${TYPES.find(t=>t.hue===h).color}"></i>`).join('')}</span><span>${free?'任意轮廓':SHAPE_NAMES[c.shape]} · 5 枝</span><span class="budget-label">≤ ${c.budget} 花材点</span><span class="commission-status">${state.sealed.includes(c.id)?'✓ 已交付':free?'不评分':`${r.total}% · ${r.count}/5`}</span></div></button>`;}).join('');
 $('#stock-count').textContent=`余 ${state.stems.filter(x=>!x.order).length} 枝`;
 $('#stock').innerHTML=TYPES.map(t=>{const available=state.stems.filter(x=>x.type===t.id&&!x.order);return `<button class="stock-item ${selected?.type===t.id&&!selected.order?'selected':''}" data-stock="${t.id}" ${available.length?'':'disabled'} aria-label="选择${t.name}，剩余${available.length}枝"><span class="qty">×${available.length}</span><span class="cost-dot">${t.cost} 点</span>${icon(t)}<strong>${t.name}</strong><span class="stock-meta">${t.shapeName} · ≤${t.length}cm</span></button>`;}).join('');
 $('#scraps').textContent=state.scraps;$('#reused').textContent=state.reused;$('#recycle').disabled=state.scraps<15;
 $('#coins').textContent=`${state.coins} 枚 · ${state.purchases}/4 已补`;
 $('#shop').innerHTML=TYPES.map(t=>`<button data-buy="${t.id}" ${state.coins<t.cost||state.purchases>=4?'disabled':''}>${t.name} ${t.cost} 枚</button>`).join('');
 $('#bouquet-title').textContent=client.name+(locked?' · 已交付':'');$('#canvas').innerHTML=arrangementSVG(state,{guides});
 $('#slots').innerHTML=Array.from({length:5},(_,i)=>{const f=flowers.find(x=>x.slot===i);return `<button class="slot ${f?'occupied':''} ${selected?.id===f?.id&&f?'selected':''}" data-slot="${i}" aria-label="花位${i+1}${f?'，'+f.name:'，空位'}" ${locked?'disabled':''}><span class="slot-number">${['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ'][i]}</span><strong>${f?f.name:'＋ 放入'}</strong><small>${f?f.length+' cm · ':''}${free?'自由':`目标 ${s.target[i]}`}</small></button>`;}).join('');
 $('#bouquet-list').innerHTML=flowers.map(f=>`<button data-select="${f.id}" aria-pressed="${selected?.id===f.id}" aria-label="编辑花位${f.slot+1}的${f.name}"><i style="background:${f.color}"></i>${f.slot+1} · ${f.name}</button>`).join('');
 $('#undo').disabled=!history.length;
 if(!selected)$('#inspector').innerHTML=`<div class="empty-inspector"><b>✂</b>先挑一枝喜欢的花。<br>剪短之前，想想下一位。</div>`;
 else {const stemLocked=state.sealed.includes(selected.order),ideal=selected.order===state.active?s.target[selected.slot]:Math.min(selected.length,44);$('#inspector').innerHTML=`<div class="selected-stem"><div class="selected-stem-head"><h3>${selected.name}</h3><span class="stem-status">${selected.order?'花位 '+(selected.slot+1):'待安放'}</span></div><p class="stem-details">${selected.shapeName} · ${selected.cost} 花材点 · 原长 ${selected.original} cm</p><div class="length-readout"><label for="trim-length">修剪后长度</label><output id="length-output">${selected.length}<small>cm</small></output></div><input class="range" id="trim-length" type="range" min="24" max="${selected.length}" value="${selected.length}" step="1" ${stemLocked?'disabled':''}><div class="range-ends"><span>24 cm</span><span>当前 ${selected.length} cm</span></div><div class="trim-actions"><button id="trim" ${stemLocked?'disabled':''}>✂ 确认剪短</button><button id="target" ${stemLocked||ideal>selected.length||free?'disabled':''} data-target="${ideal}">${selected.order?'按目标剪':'先剪到 '+ideal}</button></div><div class="trim-actions"><button id="remove" ${!selected.order||stemLocked?'disabled':''}>取下留给下一束</button></div><p class="warning">${stemLocked?'已交付 · 可撤销交付后再改动':'剪裁不可接回 · 撤销可恢复'}</p></div>`;}
 $('#score-title').textContent=free?'这束花，属于你':'心意完成度';$('#score').innerHTML=free?'∞':`${s.total}<small>/100</small>`;$('#score-bar').style.width=free?'100%':s.total+'%';
 $('#score-parts').innerHTML=free?'<p class="panel-description">不设配色、轮廓与预算标准。<br>留下你喜欢的那一点不对称。</p>':s.parts.map(([name,value,max])=>`<div class="part"><span>${name}</span><div class="part-bar"><i style="width:${value*100}%"></i></div><span>${Math.round(value*max)}/${max}</span></div>`).join('');
 $('#feedback').textContent=free?'可以不放满五枝，随时导出作品。':s.count===0?'先为三份委托留好颜色。虚线是理想轮廓，不是唯一答案。':s.total>=90?'花与花之间，刚好留出了心意。也可以试试另一种配色。':s.count<5?'还缺几枝。花量与左右平衡会随每一次摆放改变。':s.parts[1][1]<1?'有些花色不在客人的愿望里，可以留给另一份委托。':s.parts[2][1]<.9?'看一看高低：选中花束里的花，按目标剪，或保留自己的轮廓。':s.cost>client.budget?'这一束超出了花材点预算。换一枝轻巧的绿枝试试。':'试试两种以上花形，让花束更有层次。';
 $('#cost').textContent=free?`已用 ${s.cost} 花材点 · 不限预算`:`已用 ${s.cost} / ${client.budget} 花材点预算`;
 $('#deliver').disabled=locked||s.count!==5;$('#deliver').textContent=locked?'✓ 这份心意已交付':free?'系好蝴蝶结 · 收藏':'系好蝴蝶结 · 交付';
 $('#progress').textContent=free?'自由创作 · SVG 在本地导出':`${state.sealed.length} / ${sc.clients.length} 份心意已交付`;
 const done=!free&&state.sealed.length===sc.clients.length;$('#result').hidden=!done;
 if(done){const avg=Math.round(sc.clients.reduce((a,c)=>a+score(state,c.id).total,0)/sc.clients.length);$('#result').innerHTML=`<div class="eyebrow">TODAY, BEAUTIFULLY DONE</div><h2>今天的心意，都有了去处。</h2><p>三束花 · 平均完成度 ${avg} / 100 · 剪余再用 ${state.reused} cm · 余花 ${state.stems.filter(x=>!x.order).length} 枝</p><button data-next>去下一摊看看 ↗</button>`;}
}
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
 if(b.dataset.scenario){switchScenario(b.dataset.scenario);return;}if(b.dataset.order){dispatch({type:'active',id:b.dataset.order});return;}
 if(b.dataset.stock){const available=state.stems.filter(x=>x.type===b.dataset.stock&&!x.order),index=available.findIndex(x=>x.id===state.selected);const pick=available[(index+1)%available.length];if(pick)dispatch({type:'select',id:pick.id});return;}
 if(b.dataset.select){dispatch({type:'select',id:b.dataset.select});return;}
 if(b.dataset.slot!==undefined){const f=bouquet(state).find(x=>x.slot===Number(b.dataset.slot));if(state.selected)dispatch({type:'place',id:state.selected,slot:Number(b.dataset.slot)});else if(f)dispatch({type:'select',id:f.id});else toast('先从今日花材中挑一枝花。');return;}
 if(b.dataset.buy){dispatch({type:'buy',kind:b.dataset.buy});return;}
 if(b.id==='trim'){const length=Number($('#trim-length').value),f=state.stems.find(x=>x.id===state.selected);if(length===f.length){toast('先拖动长度滑杆，再确认剪短。');return;}dispatch({type:'trim',id:state.selected,length});return;}
 if(b.id==='target'){dispatch({type:'trim',id:state.selected,length:Number(b.dataset.target)});return;}
 if(b.id==='remove'){dispatch({type:'remove',id:state.selected});return;}if(b.id==='recycle'){dispatch({type:'recycle'});return;}
 if(b.id==='deliver'){dispatch({type:'seal'});return;}if(b.id==='undo'){if(history.length){state=history.pop();save();render();toast('已回到上一步，剪裁与库存一起恢复。');}return;}
 if(b.id==='export'){const blob=new Blob([arrangementSVG(state,{guides:false,exported:true})],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`花束之间-${scenarioOf(state).clients.find(x=>x.id===state.active).name}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('已导出 SVG：可缩放的花束插画。');return;}
 if(b.id==='help')$('#help-dialog').showModal();if(b.classList.contains('dialog-close'))$('#help-dialog').close();
 if(b.id==='reset')$('#reset-dialog').showModal();if(b.id==='cancel-reset')$('#reset-dialog').close();if(b.id==='confirm-reset'){state=createState(current);history=[];save();render();$('#reset-dialog').close();toast('新的一摊，从头开始。');}
 if(b.hasAttribute('data-next'))switchScenario(SCENARIOS[(SCENARIOS.findIndex(x=>x.id===current)+1)%SCENARIOS.length].id);
});
document.addEventListener('input',e=>{if(e.target.id==='trim-length')$('#length-output').innerHTML=`${e.target.value}<small>cm</small>`;});
$('#guides').addEventListener('change',e=>{guides=e.target.checked;render();});
render();
