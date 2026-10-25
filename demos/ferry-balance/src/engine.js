const item=(id,name,weight,icon,note)=>({id,name,weight,icon,note});
export const COMMISSIONS=[
 {id:'market',title:'早市第一船',subtitle:'初学 · 看好留在岸上的伙伴',chapter:'一',capacity:4,balance:3,seats:2,budget:7,par:5,
  story:'狐狸、白鹅和一袋谷子都要去东岸赶集。船不大，每一次留下谁，比带走谁更重要。',
  items:[item('fox','狐狸',3,'🦊','要与白鹅分开看护'),item('goose','白鹅',2,'🪿','会偷吃谷子'),item('grain','谷子',2,'🌾','一袋新收的谷子')],
  rules:[{a:'fox',b:'goose',text:'狐狸与白鹅不能无人照看。'},{a:'goose',b:'grain',text:'白鹅与谷子不能无人照看。'}],
  ending:'早市的第一声吆喝响起。谷子一粒没少，白鹅昂着头，狐狸装作什么也没想过。'},
 {id:'family',title:'雏鹅回家',subtitle:'进阶 · 小乘客也是小小配重',chapter:'二',capacity:4,balance:2,seats:2,budget:9,par:7,
  story:'护林员带着雏鹅加入渡口。轻轻的一点重量，能让大伙伴稳稳上船；但小家伙不能独自留岸。',
  items:[item('fox','狐狸',3,'🦊','需要配重才能独乘'),item('goose','白鹅',2,'🪿','雏鹅熟悉的伙伴'),item('grain','谷子',2,'🌾','别留给白鹅偷吃'),item('keeper','护林员',3,'🧑‍🌾','留岸时能看护大家'),item('gosling','雏鹅',1,'🐥','留岸需要熟悉的陪伴')],
  rules:[{a:'fox',b:'goose',guard:'keeper',text:'狐狸与白鹅留岸时，需要护林员。'},{a:'goose',b:'grain',guard:'keeper',text:'白鹅与谷子留岸时，需要护林员。'},{a:'gosling',requires:['keeper','goose'],text:'雏鹅留岸时，需要护林员或白鹅陪伴。'}],
  ending:'雏鹅记不清来回坐了几次船，只记得每一次摇晃，都有一双熟悉的眼睛等在岸边。'},
 {id:'garden',title:'迁往新花园',subtitle:'挑战 · 三件同行，左右要配平',chapter:'三',capacity:6,balance:2,seats:3,budget:9,par:7,
  story:'一家人和他们的小花园要搬去河对面。铜锅很重，孩子很轻；三件可以同行，但要分到两舷。',
  items:[item('gardener','园丁',4,'🧑‍🌾','能照看猫、鸟与幼苗'),item('cat','花猫',3,'🐈','会惊动小鸟'),item('bird','小鸟',2,'🐦','会啄食幼苗'),item('plant','幼苗',2,'🌱','小心好奇的小狗'),item('child','孩子',1,'🧒','需要园丁或小狗陪伴'),item('dog','小狗',3,'🐕','孩子的可靠伙伴'),item('pot','铜锅',4,'🏺','最沉的一件行李')],
  rules:[{a:'cat',b:'bird',guard:'gardener',text:'花猫与小鸟留岸时，需要园丁。'},{a:'bird',b:'plant',guard:'gardener',text:'小鸟与幼苗留岸时，需要园丁。'},{a:'plant',b:'dog',guard:'gardener',text:'小狗与幼苗留岸时，需要园丁。'},{a:'child',requires:['gardener','dog'],text:'孩子留岸时，需要园丁或小狗陪伴。'}],
  ending:'铜锅挂上新灶，幼苗栽进新土。孩子把最后一朵河边的花，送给了来来回回的摆渡人。'}
];
export const initialState=()=>({mask:0,side:0,crossings:0});
export const fullMask=c=>(1<<c.items.length)-1;
export const has=(mask,c,id)=>Boolean(mask&(1<<c.items.findIndex(i=>i.id===id)));
export const status=(c,s)=>s.mask===fullMask(c)&&s.side===1?'won':s.crossings>=c.budget?'exhausted':'playing';
export const bankItems=(c,s,side)=>c.items.filter((_,i)=>Number(Boolean(s.mask&(1<<i)))===side);
export function safetyIssues(c,ids){
 const names=new Set(ids);
 return c.rules.filter(r=>names.has(r.a)&&(r.requires?!r.requires.some(id=>names.has(id)):names.has(r.b)&&(!r.guard||!names.has(r.guard)))).map(r=>r.text);
}
export function inspectLoad(c,load){
 const left=load.left??[],right=load.right??[],all=[...left,...right];
 const unknown=all.some(id=>!c.items.some(i=>i.id===id)),duplicate=new Set(all).size!==all.length;
 const weight=ids=>ids.reduce((sum,id)=>sum+(c.items.find(i=>i.id===id)?.weight??0),0);
 const lw=weight(left),rw=weight(right);
 return {leftWeight:lw,rightWeight:rw,total:lw+rw,difference:Math.abs(lw-rw),count:all.length,unknown,duplicate};
}
export function validate(c,s,load){
 const m=inspectLoad(c,load),ids=[...(load.left??[]),...(load.right??[])];
 const fail=(code,message)=>({ok:false,code,message,metrics:m});
 if(status(c,s)!=='playing')return fail('finished',status(c,s)==='won'?'委托已经完成。':'本次船票已用尽，撤回一航或重新安排。');
 if(m.unknown||m.duplicate)return fail('invalid-load','装船名单无效，请清空后重试。');
 if(ids.some(id=>!bankItems(c,s,s.side).some(i=>i.id===id)))return fail('wrong-bank','只能从船停靠的一岸上船。');
 if(m.count>c.seats||(load.left?.length??0)>2||(load.right?.length??0)>2)return fail('seats',`这条船最多同载 ${c.seats} 件，每舷最多 2 件。`);
 if(m.total>c.capacity)return fail('capacity',`超载了：${m.total} / ${c.capacity} 份重量。请留下一位伙伴。`);
 if(m.difference>c.balance)return fail('balance',`左右差 ${m.difference}，只能差 ${c.balance}。换一舷，或找一位配重伙伴。`);
 const remains=bankItems(c,s,s.side).filter(i=>!ids.includes(i.id)).map(i=>i.id),issues=safetyIssues(c,remains);
 if(issues.length)return fail('unsafe',`离岸后不安全：${issues.join('')}`);
 return {ok:true,code:'ready',message:ids.length?'装载与留岸检查通过，可以解缆。':'可以空船摆渡；空船也使用 1 张船票。',metrics:m};
}
export function cross(c,s,load){
 const check=validate(c,s,load);if(!check.ok)return {...check,state:s};
 let mask=s.mask;for(const id of [...load.left,...load.right])mask^=1<<c.items.findIndex(i=>i.id===id);
 const next={mask,side:1-s.side,crossings:s.crossings+1};
 return {...check,state:next};
}
const cache=new WeakMap();
export function possibleLoads(c,available){
 let cached=cache.get(c);if(!cached){cached=new Map();cache.set(c,cached);}if(cached.has(available))return cached.get(available);
 const loads=[];
 for(let sub=available;;sub=(sub-1)&available){
  const count=c.items.filter((_,i)=>sub&(1<<i)).length;
  if(count<=c.seats){for(let lm=sub;;lm=(lm-1)&sub){const rm=sub^lm;
   const left=c.items.filter((_,i)=>lm&(1<<i)).map(i=>i.id),right=c.items.filter((_,i)=>rm&(1<<i)).map(i=>i.id),load={left,right},m=inspectLoad(c,load);
   if(left.length<=2&&right.length<=2&&m.total<=c.capacity&&m.difference<=c.balance){loads.push(load);break;}
   if(!lm)break;
  }}if(!sub)break;
 }
 cached.set(available,loads);return loads;
}
export function solve(c,start=initialState()){
 if(status(c,start)==='won')return [];
 const queue=[{s:start,path:[]}],seen=new Set([`${start.mask}:${start.side}`]);
 for(let n=0;n<queue.length;n++){
  const {s,path}=queue[n];if(status(c,s)!=='playing')continue;
  const available=s.side?s.mask:fullMask(c)^s.mask;
  for(const load of possibleLoads(c,available)){
   const r=cross(c,s,load);if(!r.ok)continue;
   const next=[...path,load];if(status(c,r.state)==='won')return next;
   const key=`${r.state.mask}:${r.state.side}`;if(!seen.has(key)){seen.add(key);queue.push({s:r.state,path:next});}
  }
 }return null;
}
