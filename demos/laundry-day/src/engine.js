export const PROGRAMS={eco:{name:'节能洗',duration:2,energy:1},quick:{name:'快洗',duration:1,energy:3},gentle:{name:'轻柔洗',duration:2,energy:2}};
const clothes=[{id:'shirt',name:'白衬衫',color:'white',weight:1,delicate:false,deadline:8,icon:'👔'},{id:'towel',name:'白浴巾',color:'white',weight:2,delicate:false,deadline:10,icon:'▤'},{id:'jeans',name:'深色牛仔裤',color:'dark',weight:2,delicate:false,deadline:10,icon:'👖'},{id:'tee',name:'深色 T 恤',color:'dark',weight:1,delicate:false,deadline:8,icon:'👕'},{id:'scarf',name:'红色羊毛围巾',color:'red',weight:1,delicate:true,deadline:10,icon:'🧣'},{id:'skirt',name:'红色棉裙',color:'red',weight:1,delicate:false,deadline:10,icon:'▱'}];
export const SCENARIOS=[{id:'sunny',name:'晴朗的周末',subtitle:'晒衣绳足够，电费能不能少一点？',weather:['sun','sun','cloud','sun','sun','cloud','sun','sun','cloud','sun','cloud','cloud'],energyTarget:4,clothes},{id:'showers',name:'午后的阵雨',subtitle:'雨会把已晒出的进度清零，抓住雨前的窗口。',weather:['sun','cloud','sun','rain','rain','cloud','sun','sun','cloud','sun','cloud','cloud'],energyTarget:6,clothes:clothes.map(c=>({...c,deadline:c.id==='shirt'?4:c.deadline}))},{id:'cloudy',name:'阴天赶赴约',subtitle:'全日阴天，衬衫和 T 恤要在 12 点前准备好。',weather:Array(12).fill('cloud'),energyTarget:12,clothes:clothes.map(c=>({...c,deadline:['shirt','tee'].includes(c.id)?4:c.deadline}))}];
export const WEATHER={sun:{name:'晴',icon:'☀',power:2},cloud:{name:'阴',icon:'☁',power:1},rain:{name:'雨',icon:'☂',power:0}};
export function validateBatch(scenario,plan,batch,ignoreId){
 const errors=[];const list=batch.items.map(id=>scenario.clothes.find(c=>c.id===id));
 if(!list.length||list.some(c=>!c))return ['请至少选择一件有效衣物'];
 if(new Set(batch.items).size!==batch.items.length)errors.push('同一件衣物不能重复装入');
 if(new Set(list.map(c=>c.color)).size>1)errors.push('白色、深色、红色必须分开洗，避免串色');
 if(list.reduce((a,c)=>a+c.weight,0)>5)errors.push('洗衣机最多承重 5 kg');
 if(list.some(c=>c.delicate)&&batch.program!=='gentle')errors.push('羊毛围巾必须用轻柔洗');
 if(list.some(c=>c.delicate)&&batch.dry==='dryer')errors.push('羊毛围巾不能烘干，请选自然晾晒');
 if(batch.dry==='dryer'&&list.reduce((a,c)=>a+c.weight,0)>4)errors.push('烘干机最多承重 4 kg');
 const p=Object.hasOwn(PROGRAMS,batch.program)?PROGRAMS[batch.program]:null;if(!p)errors.push('洗涤程序无效');
 if(!['line','dryer'].includes(batch.dry))errors.push('干燥方式无效');
 if(!Number.isInteger(batch.start)||batch.start<0||batch.start+(p?.duration||1)>12)errors.push('洗涤时间须在 08:00—20:00 内');
 if(!Number.isInteger(batch.dryStart)||batch.dryStart<batch.start+(p?.duration||1)||batch.dryStart>=12)errors.push('晾晒或烘干必须安排在洗完之后、20:00 之前');
 if(plan.some(b=>b.id!==ignoreId&&b.items.some(id=>batch.items.includes(id))))errors.push('有衣物已经在其他批次中，请先移除原批次');
 return errors;
}
export function simulate(scenario,plan){
 const events=Array.from({length:12},()=>[]),errors=[],results={},washed=new Set(),washing=Array(12).fill(null),drying=Array(12).fill(null);let energy=0;
 for(const c of scenario.clothes)results[c.id]={state:'unplanned',ready:null};
 const jobs=plan.map(b=>({...b,items:[...b.items],progress:0,done:false,failed:false})).sort((a,b)=>a.start-b.start||a.id.localeCompare(b.id));
 const seen=new Set();
 for(const b of jobs){const issues=validateBatch(scenario,[],b);if(b.items.some(id=>seen.has(id)))issues.push('同一衣物出现在多个批次');b.items.forEach(id=>seen.add(id));if(issues.length){b.failed=true;errors.push(...issues.map(e=>`${b.label||b.id}：${e}`));for(const id of b.items)if(results[id])results[id].state='invalid';}}
 for(let t=0;t<12;t++){
  for(const b of jobs.filter(b=>!b.failed&&b.start===t)){
   const p=PROGRAMS[b.program];if(Array.from({length:p.duration},(_,i)=>washing[t+i]).some(Boolean)){b.failed=true;errors.push(`${b.label||b.id}：${hour(t)} 洗衣机被占用`);b.items.forEach(id=>results[id].state='blocked');events[t].push({type:'bad',text:`${b.label||b.id} 无法开洗：机器冲突`});continue;}
   for(let k=t;k<t+p.duration;k++)washing[k]=b.id;energy+=p.energy;b.items.forEach(id=>results[id].state='wet');events[t].push({type:'wash',text:`${b.label||b.id} 开始${p.name}`});
  }
  for(const b of jobs.filter(b=>!b.failed&&b.start+PROGRAMS[b.program].duration===t)){washed.add(b.id);events[t].push({type:'wash',text:`${b.label||b.id} 洗好了`});}
  for(const b of jobs.filter(b=>!b.failed&&b.dryStart===t)){
   if(!washed.has(b.id)){b.failed=true;errors.push(`${b.label||b.id}：尚未洗完`);continue;}
   if(b.dry==='dryer'){
    if(drying[t]){b.failed=true;errors.push(`${b.label||b.id}：${hour(t)} 烘干机冲突`);b.items.forEach(id=>results[id].state='blocked');events[t].push({type:'bad',text:`${b.label||b.id} 烘干失败：机器冲突`});continue;}
    drying[t]=b.id;energy+=4;b.done=true;b.ready=t+1;events[t].push({type:'dry',text:`${b.label||b.id} 烘干，${hour(t+1)} 可收衣`});
   }else{const active=jobs.filter(x=>!x.failed&&!x.done&&x.dry==='line'&&x.dryStart<t).reduce((n,x)=>n+x.items.length,0);const started=jobs.filter(x=>x!==b&&!x.failed&&!x.done&&x.dry==='line'&&x.dryStart===t&&x.lineStarted).reduce((n,x)=>n+x.items.length,0);if(active+started+b.items.length>6){b.failed=true;errors.push(`${b.label||b.id}：晾衣绳最多挂 6 件`);continue;}b.lineStarted=true;events[t].push({type:'line',text:`${b.label||b.id} 挂上晾衣绳`});}
  }
  for(const b of jobs.filter(b=>!b.failed&&!b.done&&b.dry==='line'&&b.lineStarted&&b.dryStart<=t)){
   if(scenario.weather[t]==='rain'){b.progress=0;events[t].push({type:'bad',text:`${b.label||b.id} 被雨打湿，干燥进度归零`});}
   else{b.progress+=WEATHER[scenario.weather[t]].power;events[t].push({type:'line',text:`${b.label||b.id} 晾晒进度 ${Math.min(3,b.progress)}/3`});}
   if(b.progress>=3){b.done=true;b.ready=t+1;events[t].push({type:'good',text:`${b.label||b.id} 晒干了，${hour(t+1)} 收衣`});}
  }
 }
 for(const b of jobs){if(b.done)for(const id of b.items)results[id]={state:b.ready<=scenario.clothes.find(c=>c.id===id).deadline?'ready':'late',ready:b.ready};else if(!b.failed)for(const id of b.items)results[id]={state:'wet',ready:null};}
 const ready=Object.values(results).filter(r=>r.state==='ready').length;const complete=ready===scenario.clothes.length&&errors.length===0;const stars=complete?(energy<=scenario.energyTarget?3:energy<=scenario.energyTarget+4?2:1):0;
 return {events,errors,results,energy,ready,complete,stars,washing,drying,jobs:jobs.map(({progress,ready,id,failed,done})=>({progress,ready,id,failed,done}))};
}
export function hour(slot){return `${String(8+slot).padStart(2,'0')}:00`;}
export function makeBatch(items,start,program='eco',dry='line',dryStart=start+PROGRAMS[program].duration,id='batch'){return {id,label:id,items,start,program,dry,dryStart};}
