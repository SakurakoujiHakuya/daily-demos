import {SCENARIOS,validateBatch} from './engine.js';
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
// Rebuild named maps rather than retaining untrusted prototypes or array containers.
export function normalizeStore(saved){
 const store={scenario:'sunny',plans:{},best:{}};
 if(!record(saved))saved={};
 if(SCENARIOS.some(day=>day.id===saved.scenario))store.scenario=saved.scenario;
 const plans=record(saved.plans)?saved.plans:{};
 const best=record(saved.best)?saved.best:{};
 for(const day of SCENARIOS){
  const clean=[];
  const raw=Object.hasOwn(plans,day.id)&&Array.isArray(plans[day.id])?plans[day.id]:[];
  for(const [i,b] of raw.entries()){
   if(!record(b)||!Array.isArray(b.items))continue;
   const normalized={id:`saved-${i}`,label:`第${i+1}批`,items:b.items.filter(x=>typeof x==='string'),program:b.program,start:b.start,dry:b.dry,dryStart:b.dryStart};
   if(!validateBatch(day,clean,normalized).length)clean.push(normalized);
  }
  store.plans[day.id]=clean;
  const score=Object.hasOwn(best,day.id)?best[day.id]:null;
  if(record(score)&&Number.isFinite(score.energy)&&score.energy>=0&&Number.isInteger(score.stars)&&score.stars>=1&&score.stars<=3)store.best[day.id]={energy:score.energy,stars:score.stars};
 }
 return store;
}
