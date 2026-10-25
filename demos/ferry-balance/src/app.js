import {COMMISSIONS,initialState,bankItems,inspectLoad,validate,cross,status,solve} from './engine.js';
const $=id=>document.getElementById(id);
let index=0,state=initialState(),load={left:[],right:[]},target='left',history=[],log=[],hint='';
let records={};try{records=JSON.parse(localStorage.getItem('ferry-balance-records')||'{}')||{};}catch{}
const c=()=>COMMISSIONS[index],names=ids=>ids.map(id=>c().items.find(i=>i.id===id).name).join('、')||'空舷';
function feedback(text='',good=false){$('feedback').textContent=text;$('feedback').className='feedback'+(good?' success':'');}
function select(n){index=n;state=initialState();load={left:[],right:[]};target='left';history=[];log=[];hint='';feedback();render();}
function render(){
 const spec=c(),m=inspectLoad(spec,load),v=validate(spec,state,load),phase=status(spec,state),selected=[...load.left,...load.right];
 $('commissions').innerHTML=COMMISSIONS.map((x,i)=>`<button class="commission-tab" aria-selected="${i===index}" data-commission="${i}"><span class="tab-number">0${i+1}</span><span><strong>${x.title}</strong><small>${x.subtitle}</small></span>${records[x.id]?'<span class="tab-star" aria-label="已完成">✦</span>':''}</button>`).join('');
 $('chapter').textContent=`委托 ${spec.chapter} / ${spec.items.length} 位伙伴与行李`;$('title').textContent=spec.title;$('story').textContent=spec.story;
 $('remaining').innerHTML=`${Math.max(0,spec.budget-state.crossings)} <small>/ ${spec.budget}</small>`;
 $('record').textContent=records[spec.id]?`本地最佳 ${records[spec.id]} 航 · 理想 ${spec.par} 航`:`理想航数 ${spec.par} 航`;
 for(const side of [0,1]){
  const label=side?'east':'west';$(label+'-state').textContent=state.side===side?'小船停靠':'留岸等候';$(label+'-state').className=state.side===side?'docked':'';
  const items=bankItems(spec,state,side).filter(i=>!selected.includes(i.id));
  $(label+'-items').innerHTML=items.length?items.map(i=>`<button class="passenger" data-board="${i.id}" title="${i.note}" aria-label="让${i.name}登船，重量${i.weight}" ${state.side!==side||phase!=='playing'?'disabled':''}><span class="icon" aria-hidden="true">${i.icon}</span><strong>${i.name}</strong><span class="weight-tag">${i.weight}<small> 重</small></span></button>`).join(''):`<p class="empty-bank">${side?'岸边静静等候':'伙伴们都已出发'}<br>⌁</p>`;
 }
 for(const side of ['left','right']){
  $(side+'-weight').textContent=m[side+'Weight']+' 重';
  $(side+'-load').innerHTML=load[side].length?load[side].map(id=>{const i=spec.items.find(i=>i.id===id);return `<button class="loaded-token" data-remove="${id}" aria-label="让${i.name}下船"><span aria-hidden="true">${i.icon}</span><small>${i.name} · ${i.weight}</small></button>`;}).join(''):'<span class="empty-seat">虚位以待</span>';
  $(side+'-target').className='target'+(target===side?' active':'');$(side+'-target').textContent=(target===side?'● 装入':'选择')+(side==='left'?'左舷':'右舷');$(side+'-target').setAttribute('aria-pressed',String(target===side));
 }
 $('boat').className='boat'+(state.side?' at-east':'');$('boat-direction').textContent=state.side?'东岸已靠泊 · 下一航向西 ←':'西岸已靠泊 · 下一航向东 →';
 $('balance-needle').style.left=`${50+Math.max(-40,Math.min(40,(m.rightWeight-m.leftWeight)*9))}%`;$('balance-needle').style.background=m.difference>spec.balance?'var(--error)':'var(--teal)';
 $('balance-reading').textContent=`差 ${m.difference} / 限 ${spec.balance}`;
 $('capacity-check').textContent=`载重 ${m.total} / ${spec.capacity}`;$('capacity-check').className=m.total>spec.capacity?'bad':'';
 $('seat-check').textContent=`座位 ${m.count} / ${spec.seats}`;$('seat-check').className=m.count>spec.seats?'bad':'';
 $('safety-check').textContent=v.ok?'✓ 离岸检查通过':phase==='playing'?'◇ 等待配载':phase==='won'?'✓ 委托完成':'船票用尽';$('safety-check').className=v.ok?'':'bad';
 $('check-message').textContent=v.message;$('sail').innerHTML=`${phase==='won'?'平安抵达':phase==='exhausted'?'船票用尽':state.side?'解缆，回西岸':'解缆，去东岸'} <span>${state.side?'←':'→'}</span>`;$('sail').disabled=phase!=='playing';
 $('undo').disabled=!history.length;$('clear').disabled=!selected.length;
 $('rules').innerHTML=spec.rules.map(r=>`<li>${r.text}</li>`).join('')+`<li>船载重最多 ${spec.capacity}，两舷重量差不超过 ${spec.balance}；总计 ${spec.seats} 件，每舷最多 2 件。</li>`;
 $('ledger-count').textContent=`${state.crossings} 航 / ${spec.budget} 航`;
 $('log').innerHTML=log.length?log.map((entry,i)=>`<li><span class="log-num">${String(i+1).padStart(2,'0')}</span><span class="log-dir">${i%2?'东 → 西':'西 → 东'}</span><span>${entry.length?names(entry):'空船摆渡'}</span></li>`).join(''):'<li class="no-log">还没有解缆。<br>先选一舷，再点岸上的伙伴试试看。</li>';
 $('hint-panel').hidden=!hint;$('hint-panel').textContent=hint;
 $('ending').hidden=phase!=='won';
 if(phase==='won')$('ending').innerHTML=`<p class="eyebrow">${state.crossings<=spec.par?'✦ 恰好的每一航':'✧ 平安就是好安排'} · 委托完成</p><h3>都到岸了，船也可以歇一会儿。</h3><p>${spec.ending}</p><p>用了 ${state.crossings} 航，剩余 ${spec.budget-state.crossings} 张船票。${state.crossings<=spec.par?'这是一条最短往返方案。':'试试重新安排，寻找更短的往返方案。'}</p>${index<COMMISSIONS.length-1?'<button id="next">接下一份委托 →</button>':'<button id="next">回到第一份委托 ↻</button>'}`;
}
$('commissions').addEventListener('click',e=>{const b=e.target.closest('[data-commission]');if(b)select(Number(b.dataset.commission));});
document.querySelector('.river-map').addEventListener('click',e=>{
 const board=e.target.closest('[data-board]'),remove=e.target.closest('[data-remove]');
 if(board&&!board.disabled){const id=board.dataset.board;if(load.left.length+load.right.length>=c().seats){feedback(`船上只有 ${c().seats} 个位置，先让一位伙伴下船。`);return;}if(load[target].length>=2){feedback('这一舷最多放两件，换到另一舷再装载。');return;}load[target].push(id);target=target==='left'?'right':'left';hint='';feedback();render();}
 if(remove){const id=remove.dataset.remove;for(const s of ['left','right']){if(load[s].includes(id))target=s;load[s]=load[s].filter(x=>x!==id);}hint='';feedback();render();}
});
for(const s of ['left','right'])$(s+'-target').addEventListener('click',()=>{target=s;render();});
$('sail').addEventListener('click',()=>{const r=cross(c(),state,load);if(!r.ok){feedback(r.message);return;}history.push({...state});log.push([...load.left,...load.right]);state=r.state;load={left:[],right:[]};target='left';hint='';
 const p=status(c(),state);if(p==='won'){records[c().id]=Math.min(Number(records[c().id])||Infinity,state.crossings);try{localStorage.setItem('ferry-balance-records',JSON.stringify(records));}catch{}feedback('最后一位伙伴也平安到岸了。',true);}else if(p==='exhausted')feedback('船票用尽了，但还有伙伴没到东岸。可以撤回一航，换一种安排。');else feedback(`第 ${state.crossings} 航已抵${state.side?'东':'西'}岸，乘客与行李已自动下船。`,true);render();});
$('undo').addEventListener('click',()=>{if(!history.length)return;state=history.pop();log.pop();load={left:[],right:[]};target='left';hint='';feedback('撤回了上一航，船票也退回来了。',true);render();});
$('clear').addEventListener('click',()=>{load={left:[],right:[]};target='left';hint='';feedback();render();});
$('restart').addEventListener('click',()=>select(index));
$('hint').addEventListener('click',()=>{const p=solve(c(),state);hint=p===null?'老船夫想了想：余下的船票不够完成这一局了。撤回一航，或重新摆渡；装船检查只能保证眼前安全，不能保证后面走得通。':!p.length?'老船夫笑着说：都平安到岸了，歇一会儿吧。':`老船夫的建议（从靠岸局面计算，未替你装船）：下一航左舷放${names(p[0].left)}，右舷放${names(p[0].right)}。从这里最少还需 ${p.length} 航。`;render();});
$('ending').addEventListener('click',e=>{if(e.target.closest('#next'))select((index+1)%COMMISSIONS.length);});
render();
