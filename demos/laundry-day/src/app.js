import {SCENARIOS,PROGRAMS,WEATHER,simulate,validateBatch,hour} from './engine.js';
const $=s=>document.querySelector(s),key='hakuya-laundry-v1';let store={scenario:'sunny',plans:{},best:{}},selected=new Set(),undo=[],redo=[],result=null,serial=0;
try{const saved=JSON.parse(localStorage.getItem(key));if(saved&&SCENARIOS.some(s=>s.id===saved.scenario)&&saved.plans&&typeof saved.plans==='object')store={...store,...saved};}catch{}
// Stored drafts are treated as data: accept only known fields and valid batch shapes.
for(const day of SCENARIOS){
 const clean=[];
 const raw=Array.isArray(store.plans[day.id])?store.plans[day.id]:[];
 for(const [i,b] of raw.entries()){
  if(!b||!Array.isArray(b.items))continue;
  const normalized={id:`saved-${i}`,label:`第${i+1}批`,items:b.items.filter(x=>typeof x==='string'),program:b.program,start:b.start,dry:b.dry,dryStart:b.dryStart};
  if(!validateBatch(day,clean,normalized).length)clean.push(normalized);
 }
 store.plans[day.id]=clean;
}
if(!store.best||typeof store.best!=='object')store.best={};
const scenario=()=>SCENARIOS.find(s=>s.id===store.scenario);const plan=()=>Array.isArray(store.plans[store.scenario])?store.plans[store.scenario]:[];
function save(){try{localStorage.setItem(key,JSON.stringify(store));}catch{$('#message').textContent='浏览器无法保存，本次仍可继续游玩。';}}
function mutate(next){undo.push(JSON.stringify(plan()));redo=[];store.plans[store.scenario]=next;result=null;$('#report').hidden=true;save();render();}
function message(text,error=false){$('#message').textContent=text;$('#message').classList.toggle('error',error);}
function render(){
 $('#scenarios').innerHTML=SCENARIOS.map((s,i)=>`<button data-day="${s.id}" aria-pressed="${s.id===store.scenario}">${['☀','☂','☁'][i]} ${s.name}</button>`).join('');
 $('#day-title').textContent=scenario().name;$('#day-subtitle').textContent=scenario().subtitle;
 $('#forecast').innerHTML=scenario().weather.map((w,t)=>`<div class="weather ${w}"><small>${hour(t)}</small><strong>${WEATHER[w].icon}</strong><small>${WEATHER[w].name}</small></div>`).join('');
 const assigned=new Set(plan().flatMap(b=>b.items));
 $('#clothes').innerHTML=scenario().clothes.map(c=>`<button class="garment" data-cloth="${c.id}" aria-pressed="${selected.has(c.id)}" ${assigned.has(c.id)?'disabled':''}><span class="icon" aria-hidden="true">${c.icon}</span><strong>${c.name}</strong><small>${{white:'白色',dark:'深色',red:'红色'}[c.color]} · ${c.weight} kg${c.delicate?' · 必须轻柔 / 禁烘干':''}<br>${hour(c.deadline)} 前准备好</small>${assigned.has(c.id)?'<span class="assigned">已安排 ✓</span>':''}</button>`).join('');
 $('#selected-count').textContent=`已选 ${selected.size} 件`;$('#weight').textContent=scenario().clothes.filter(c=>selected.has(c.id)).reduce((a,c)=>a+c.weight,0);
 $('#undo').disabled=!undo.length;$('#redo').disabled=!redo.length;
 renderTimeline();
 $('#batches').innerHTML=plan().length?plan().map(b=>`<article class="batch"><div><b>${b.label} / ${b.items.map(id=>scenario().clothes.find(c=>c.id===id)?.name||'?').join('、')}</b><p>${hour(b.start)} ${PROGRAMS[b.program]?.name||'?'} → ${hour(b.start+(PROGRAMS[b.program]?.duration||0))} 洗完 · ${hour(b.dryStart)} ${b.dry==='line'?'开始晾晒':'开始烘干'}</p></div><div class="batch-actions"><button data-earlier="${b.id}" aria-label="${b.label}整体提前一小时">← 提前 1h</button><button data-later="${b.id}" aria-label="${b.label}整体延后一小时">延后 1h →</button><button data-edit="${b.id}">重排</button><button data-delete="${b.id}">移除</button></div></article>`).join(''):'<p class="empty">还没有安排。选衣物，然后把第一批放进时间表。</p>';
 updateFinish();
}
function renderTimeline(){
 let html='<div class="timeline-inner"><div></div>'+Array.from({length:12},(_,i)=>`<div class="timehead">${hour(i)}</div>`).join('');
 for(const [type,label] of [['wash','◌ 洗衣机'],['line','☀ 晾衣绳'],['dryer','▣ 烘干机']]){
  html+=`<div class="resource">${label}</div>`;
  const preview=simulate(scenario(),plan());
  for(let t=0;t<12;t++){const list=plan().filter(b=>type==='wash'?t>=b.start&&t<b.start+PROGRAMS[b.program]?.duration:type==='dryer'?b.dry==='dryer'&&t===b.dryStart:b.dry==='line'&&t>=b.dryStart&&t<(preview.jobs.find(j=>j.id===b.id)?.ready??12));const conflict=type!=='line'&&list.length>1;html+=`<div class="slot ${list.length?type:''} ${conflict?'conflict':''}" title="${list.map(b=>b.label).join('、')||'空闲'}">${conflict?'冲突':list.length?list.map(b=>b.label.replace('第','').replace('批','')).join('+'):''}</div>`;}
 }$('#timeline').innerHTML=html+'</div>';
}
function updateFinish(){const p=PROGRAMS[$('#program').value],t=Number($('#wash-time').value);$('#wash-finish').textContent=`这批将在 ${hour(t+p.duration)} 洗完。可以先放着，等合适的天气再晾。`;}
function defaultDryTime(){const v=Math.min(11,Number($('#wash-time').value)+PROGRAMS[$('#program').value].duration);$('#dry-time').value=v;updateFinish();}
function renderResult(){
 result=simulate(scenario(),plan());$('#report').hidden=false;$('#stars').textContent='★'.repeat(result.stars)+'☆'.repeat(3-result.stars);$('#done-score').textContent=`${result.ready} / ${scenario().clothes.length}`;$('#energy-score').textContent=result.energy;$('#energy-target').textContent=`≤ ${scenario().energyTarget}`;
 $('#verdict').textContent=result.complete?(result.stars===3?'衣服按时收好了，还把电费留给了周末。漂亮的一天。':'衣服都赶上了。再试试提前分批、利用晴天，能否少开一次烘干？'):'还没全部赶上。看一看机器冲突、天气和每件衣服的截止时间，再调整计划。';
 const labels={unplanned:'还在脏衣篮',ready:'按时完成',late:'已干，但迟到了',wet:'到 20:00 仍未干',blocked:'机器冲突，未完成',invalid:'计划无效'};
 $('#garment-results').innerHTML=scenario().clothes.map(c=>{const r=result.results[c.id];return `<div class="result ${r.state}">${c.icon} ${c.name}<small>${labels[r.state]}${r.ready!==null?` · ${hour(r.ready)}`:''}<br>截止 ${hour(c.deadline)}</small></div>`;}).join('');$('#errors').innerHTML=result.errors.map(e=>`<p>! ${e}</p>`).join('');
 if(result.complete&&(!store.best[store.scenario]||result.energy<store.best[store.scenario].energy)){store.best[store.scenario]={energy:result.energy,stars:result.stars};save();}
 const best=store.best[store.scenario];$('#best').textContent=best?`本场景最佳记录：全部按时完成，用电 ${best.energy} 点，${best.stars} 星。`:'先完成一次，再挑战节电纪录。';
 $('#hour-range').value=0;renderHour();$('#full-log').innerHTML=result.events.map((events,t)=>`<h4>${hour(t)}—${hour(t+1)} ${WEATHER[scenario().weather[t]].icon}</h4>${events.length?events.map(e=>`<div class="event ${e.type}">${e.text}</div>`).join(''):'<p>空闲时段。</p>'}`).join('');
}
function renderHour(){if(!result)return;const t=Number($('#hour-range').value);$('#hour-label').textContent=`${hour(t)} ${WEATHER[scenario().weather[t]].icon}`;$('#hour-events').innerHTML=result.events[t].length?result.events[t].map(e=>`<div class="event ${e.type}">${e.text}</div>`).join(''):'<div class="event">这一小时没有新事件，可以安排另一批或等待好天气。</div>';$('#prev-hour').disabled=t===0;$('#next-hour').disabled=t===11;}
for(const el of ['#wash-time','#dry-time'])$(el).innerHTML=Array.from({length:12},(_,i)=>`<option value="${i}">${hour(i)}</option>`).join('');$('#dry-time').value=2;
$('#scenarios').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(!b)return;store.scenario=b.dataset.day;selected.clear();undo=[];redo=[];result=null;$('#report').hidden=true;save();render();message('已切换场景，原场景计划会保留。');});
$('#clothes').addEventListener('click',e=>{const b=e.target.closest('[data-cloth]');if(!b)return;selected.has(b.dataset.cloth)?selected.delete(b.dataset.cloth):selected.add(b.dataset.cloth);render();});
$('#clear-selection').onclick=()=>{selected.clear();render();};$('#program').onchange=defaultDryTime;$('#wash-time').onchange=defaultDryTime;
$('#add-batch').onclick=()=>{const batch={id:`b${Date.now()}-${serial++}`,label:`第${Math.max(0,...plan().map(b=>parseInt(b.label.replace(/\D/g,''))||0))+1}批`,items:[...selected],program:$('#program').value,start:Number($('#wash-time').value),dry:$('#dry-method').value,dryStart:Number($('#dry-time').value)};const errors=validateBatch(scenario(),plan(),batch);if(errors.length){message(errors.join('；'),true);return;}selected.clear();mutate([...plan(),batch]);message('已加入时间表。可以再选一批，或试跑整天查看结果。');};
$('#batches').onclick=e=>{const btn=e.target.closest('button');if(!btn)return;const id=btn.dataset.delete||btn.dataset.edit||btn.dataset.earlier||btn.dataset.later;const b=plan().find(x=>x.id===id);if(!b)return;if(btn.dataset.edit){selected=new Set(b.items);$('#program').value=b.program;$('#wash-time').value=b.start;$('#dry-method').value=b.dry;$('#dry-time').value=b.dryStart;mutate(plan().filter(x=>x.id!==id));message('已取回这批衣物。修改时间后重新加入；也可以撤销取回。');$('.planner').scrollIntoView({behavior:'smooth',block:'center'});}else if(btn.dataset.delete){mutate(plan().filter(x=>x.id!==id));message('已移除这批，可重新安排衣物。');}else{const delta=btn.dataset.earlier?-1:1;const next={...b,start:b.start+delta,dryStart:b.dryStart+delta};const errors=validateBatch(scenario(),plan(),next,id);if(errors.length)return message(errors.join('；'),true);mutate(plan().map(x=>x.id===id?next:x));message(`这批已${delta<0?'提前':'延后'}一小时。`);}};
$('#undo').onclick=()=>{if(!undo.length)return;redo.push(JSON.stringify(plan()));store.plans[store.scenario]=JSON.parse(undo.pop());selected.clear();result=null;$('#report').hidden=true;save();render();message('已撤销上一步。');};$('#redo').onclick=()=>{if(!redo.length)return;undo.push(JSON.stringify(plan()));store.plans[store.scenario]=JSON.parse(redo.pop());selected.clear();result=null;$('#report').hidden=true;save();render();message('已重做。');};$('#reset').onclick=()=>{selected.clear();mutate([]);message('已清空本日计划。点撤销可以找回。');};$('#run').onclick=()=>{renderResult();$('#report').scrollIntoView({behavior:'smooth',block:'start'});};$('#hour-range').oninput=renderHour;$('#prev-hour').onclick=()=>{$('#hour-range').value=Number($('#hour-range').value)-1;renderHour();};$('#next-hour').onclick=()=>{$('#hour-range').value=Number($('#hour-range').value)+1;renderHour();};$('#rules-toggle').onclick=()=>{const open=$('#rules').hidden;$('#rules').hidden=!open;$('#rules-toggle').setAttribute('aria-expanded',open);$('#rules-toggle').textContent=open?'收起规则 −':'规则说明 ＋';};render();
