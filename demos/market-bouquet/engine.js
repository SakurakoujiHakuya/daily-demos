/** Pure deterministic game rules. All flowers, clients and units are fictional. */
export const TYPES = [
 {id:'coral',name:'珊瑚团花',hue:'coral',color:'#d77d70',shape:'round',shapeName:'团形',length:56,cost:3},
 {id:'gold',name:'金盏小杯',hue:'gold',color:'#d9ad52',shape:'cup',shapeName:'杯形',length:52,cost:2},
 {id:'cream',name:'奶油星花',hue:'cream',color:'#f2e3bd',shape:'star',shapeName:'星形',length:64,cost:2},
 {id:'plum',name:'暮紫花穗',hue:'plum',color:'#93748e',shape:'spike',shapeName:'穗形',length:72,cost:3},
 {id:'blue',name:'雾蓝纸花',hue:'blue',color:'#8da9bc',shape:'star',shapeName:'星形',length:66,cost:2},
 {id:'sage',name:'鼠尾绿枝',hue:'sage',color:'#8b9b78',shape:'leaf',shapeName:'线形',length:70,cost:1}
];
export const SHAPES={dome:[36,44,50,44,36],fan:[48,45,42,45,48],spire:[36,48,62,48,36]};
export const SHAPE_NAMES={dome:'圆拱',fan:'展开',spire:'尖塔'};
const c=(id,name,note,hues,shape,budget=12)=>({id,name,note,hues,shape,budget,count:5});
export const SCENARIOS=[
 {id:'morning',name:'晨光小集',subtitle:'三份温柔，各有形状',weather:'晴 · 第一摊',coins:4,clients:[c('a','窗边的早餐','一束暖色的小圆拱，放在早餐桌。',['coral','gold','cream'],'dome'),c('b','开门的书店','想要向外舒展，蓝与绿都安静一点。',['blue','sage','cream'],'fan',10),c('c','送给远行的人','留一条向上的线，紫色是主角之一。',['plum','coral','sage'],'spire')]},
 {id:'afterrain',name:'雨后长街',subtitle:'让冷色与留白相遇',weather:'小雨转晴 · 第二摊',coins:3,clients:[c('a','雨停后的信','冷色圆拱，不用太张扬。',['plum','blue','cream'],'dome'),c('b','黄色的雨伞','暖色向两边打开，像一把小伞。',['gold','coral','sage'],'fan',11),c('c','屋顶的晚风','长一点、轻一点，蓝绿之间留一颗星。',['blue','sage','cream'],'spire',10)]},
 {id:'dusk',name:'黄昏的礼物',subtitle:'有限的花，宽阔的心意',weather:'晚霞 · 第三摊',coins:2,clients:[c('a','散场后的一束','紫与金一起舒展，有一点戏剧感。',['plum','gold','sage'],'fan'),c('b','给自己的一束','奶油色与珊瑚色，抱成一个小圆拱。',['cream','coral','gold'],'dome'),c('c','最后一班电车','用冷色拉出一条向上的线。',['plum','blue','sage'],'spire',11)]},
 {id:'free',name:'自由花台',subtitle:'不必交卷，只看花开',weather:'随时 · 自由创作',coins:8,clients:[c('free','没有标准答案','随心剪裁、摆放，导出你的花束。',TYPES.map(x=>x.hue),'dome',99)]}
];
export const clone=s=>JSON.parse(JSON.stringify(s));
export function createState(id='morning'){
 const scenario=SCENARIOS.find(x=>x.id===id)||SCENARIOS[0];
 return {version:1,scenario:scenario.id,coins:scenario.coins,scraps:0,reused:0,purchases:0,selected:null,active:scenario.clients[0].id,stems:TYPES.flatMap(t=>Array.from({length:4},(_,i)=>({...t,id:`${t.id}-${i+1}`,type:t.id,original:t.length,order:null,slot:null}))),sealed:[],serial:0};
}
export const scenarioOf=s=>SCENARIOS.find(x=>x.id===s.scenario);
export const bouquet=(s,id=s.active)=>s.stems.filter(x=>x.order===id).sort((a,b)=>a.slot-b.slot);
export function score(s,id=s.active){
 const client=scenarioOf(s).clients.find(x=>x.id===id),flowers=bouquet(s,id),target=SHAPES[client.shape];
 const count=Math.min(1,flowers.length/5),palette=flowers.length?flowers.filter(x=>client.hues.includes(x.hue)).length/flowers.length:0;
 const height=flowers.length?flowers.reduce((a,x)=>a+Math.max(0,1-Math.abs(x.length-target[x.slot])/16),0)/flowers.length:0;
 const diversity=Math.min(1,new Set(flowers.map(x=>x.shape)).size/2);
 const balance=flowers.length?Math.max(0,1-Math.abs(flowers.reduce((a,x)=>a+(x.slot-2),0)/flowers.length)/2):0;
 const cost=flowers.reduce((a,x)=>a+x.cost,0),budget=flowers.length?Math.max(0,1-Math.max(0,cost-client.budget)/5):0;
 const parts=[['花量',count,20],['配色',palette,20],['轮廓',height,20],['花形',diversity,15],['平衡',balance,15],['用料',budget,10]];
 return {total:Math.round(parts.reduce((a,p)=>a+p[1]*p[2],0)),parts,cost,count:flowers.length,target,free:s.scenario==='free'};
}
const bad=message=>{throw Error(message);};
export function act(state,action){
 const s=clone(state),sc=scenarioOf(s),stem=s.stems.find(x=>x.id===action.id);
 if(action.type==='active'){if(!sc.clients.some(x=>x.id===action.id))bad('找不到这份委托');s.active=action.id;return s;}
 if(action.type==='select'){if(!stem)bad('找不到这枝花');s.selected=stem.id;return s;}
 if(action.type==='buy'){
  const t=TYPES.find(x=>x.id===action.kind);if(!t)bad('找不到这份花材');if(s.purchases>=4)bad('这摊最多补货四枝');if(s.coins<t.cost)bad('零钱不足，试试回收剪余');
  s.coins-=t.cost;s.purchases++;s.serial++;s.stems.push({...t,id:`buy-${s.serial}`,type:t.id,original:t.length,order:null,slot:null});s.selected=`buy-${s.serial}`;return s;
 }
 if(action.type==='recycle'){if(s.scraps<15)bad('攒满 15 cm 剪余才够做一份纸绳装饰');s.scraps-=15;s.reused+=15;s.coins++;return s;}
 if(action.type==='seal'){if(s.sealed.includes(s.active))bad('这束已经交付');if(bouquet(s).length!==5)bad('先放满五个花位，再交付');s.sealed.push(s.active);return s;}
 if(!stem)bad('先选中一枝花');
 if(stem.order&&s.sealed.includes(stem.order))bad('已交付的花束只能通过撤销恢复');
 if(action.type==='trim'){const n=Number(action.length);if(!Number.isInteger(n)||n<24||n>stem.length)bad('只能剪短到 24 cm 以上，剪掉不能接回');s.scraps+=stem.length-n;stem.length=n;return s;}
 if(action.type==='remove'){stem.order=null;stem.slot=null;return s;}
 if(action.type==='place'){
  if(s.sealed.includes(s.active))bad('这束已经交付，请换一份委托');if(!Number.isInteger(action.slot)||action.slot<0||action.slot>4)bad('请选择五个花位之一');
  const other=s.stems.find(x=>x.order===s.active&&x.slot===action.slot&&x.id!==stem.id);
  const oldOrder=stem.order,oldSlot=stem.slot;
  if(other){other.order=oldOrder;other.slot=oldSlot;}
  stem.order=s.active;stem.slot=action.slot;return s;
 }
 bad('不认识这个操作');
}
export function validState(s){
 if(!s||s.version!==1||!SCENARIOS.some(x=>x.id===s.scenario)||!Array.isArray(s.stems)||!Array.isArray(s.sealed))return false;
 if(!['coins','scraps','reused','purchases','serial'].every(k=>Number.isInteger(s[k])&&s[k]>=0))return false;
 const ids=new Set(),slots=new Set(),orders=scenarioOf(s).clients.map(x=>x.id);
 for(const x of s.stems){const t=TYPES.find(t=>t.id===x.type);if(!t||typeof x.id!=='string'||!/^(coral|gold|cream|plum|blue|sage)-[1-4]$|^buy-[1-4]$/.test(x.id)||ids.has(x.id)||!Number.isInteger(x.length)||x.length<24||x.length>x.original||x.original!==t.length||['name','hue','color','shape','shapeName','cost'].some(k=>x[k]!==t[k]))return false;ids.add(x.id);if(x.order!==null){if(!orders.includes(x.order)||!Number.isInteger(x.slot)||x.slot<0||x.slot>4)return false;const key=x.order+x.slot;if(slots.has(key))return false;slots.add(key);}}
 return orders.includes(s.active)&&s.sealed.every(id=>orders.includes(id));
}
export function escapeXML(x){return String(x).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));}
export function flowerSVG(stem,x,y,scale=1){
 const c=stem.color,shape=stem.shape;let petals='';
 if(shape==='leaf') petals=`<path d="M0 0 Q-36 -28 -25 -45 Q3 -34 0 0 M0 5 Q34 -13 27 -34 Q0 -23 0 5 M0 -10 Q-17 -48 2 -64 Q19 -41 0 -10" fill="${c}"/>`;
 else if(shape==='spike') petals=Array.from({length:7},(_,i)=>`<ellipse cx="${i%2?7:-7}" cy="${10-i*9}" rx="9" ry="12" transform="rotate(${i%2?30:-30} ${i%2?7:-7} ${10-i*9})" fill="${c}"/>`).join('');
 else if(shape==='cup') petals=`<path d="M-23 -13 Q-20 29 0 23 Q22 26 23 -13 L10 -7 L0 -20 L-10 -7Z" fill="${c}"/><path d="M0 20 L0 -11" stroke="#fff" opacity=".3"/>`;
 else {petals=Array.from({length:shape==='star'?6:8},(_,i)=>`<ellipse cx="0" cy="-14" rx="${shape==='star'?9:14}" ry="${shape==='star'?23:18}" transform="rotate(${i*(shape==='star'?60:45)})" fill="${c}"/>`).join('');petals+=`<circle r="8" fill="#c59449"/><circle r="4" fill="#f5ddb0"/>`;}
 return `<g transform="translate(${x} ${y}) scale(${scale})">${petals}</g>`;
}
export function arrangementSVG(s,{guides=true,exported=false}={}){
 const list=bouquet(s),sc=scenarioOf(s),client=sc.clients.find(x=>x.id===s.active),target=SHAPES[client.shape];
 let content=`<defs><pattern id="paper" width="7" height="7" patternUnits="userSpaceOnUse"><circle cx="1" cy="2" r=".45" fill="#a48d6a" opacity=".13"/></pattern></defs><rect width="560" height="540" fill="#f4f0e5"/><rect width="560" height="540" fill="url(#paper)"/><ellipse cx="280" cy="466" rx="129" ry="12" fill="#9a8260" opacity=".09"/>`;
 if(guides&&s.scenario!=='free'){content+=`<path d="${target.map((l,i)=>`${i?'L':'M'} ${140+i*70} ${416-l*4}`).join(' ')}" stroke="#a6ab94" fill="none" stroke-dasharray="3 7" opacity=".6"/>`;target.forEach((l,i)=>content+=`<circle cx="${140+i*70}" cy="${416-l*4}" r="22" fill="none" stroke="#a6ab94" stroke-dasharray="2 6" opacity=".35"/>`);}
 content+=`<path d="M137 288 L280 484 L420 288 L349 317 L280 294 L212 319Z" fill="#d7c6a7"/><path d="M137 288 L280 484 L240 345Z" fill="#e6d7bc"/><path d="M420 288 L280 484 L313 348Z" fill="#c9b898"/>`;
 list.forEach(f=>{const x=140+f.slot*70,y=416-f.length*4;content+=`<path d="M280 448 Q${280+(x-280)*.2} 350 ${x} ${y}" stroke="#687b58" stroke-width="3" fill="none"/><path d="M${(x+280)/2} ${(y+448)/2} q-29 -29 -39 -8 q20 22 39 8" fill="#94a47c" opacity=".8"/>`;});
 list.forEach(f=>content+=flowerSVG(f,140+f.slot*70,416-f.length*4,1));
 content+=`<path d="M255 423 Q280 430 307 420 L302 432 L258 435Z" fill="#a45f50"/><path d="M280 432 Q218 447 225 408 Q243 394 280 432 Q319 392 332 409 Q342 439 280 432 M280 432 L253 464 M280 432 L307 468" stroke="#a45f50" stroke-width="5" fill="none" stroke-linecap="round"/>`;
 if(!list.length)content+=`<text x="280" y="219" text-anchor="middle" fill="#8e8b78" font-size="15" font-family="serif">从一枝花开始</text>`;
 if(exported)content+=`<text x="28" y="31" fill="#52624b" font-size="18" font-family="serif">花束之间 · ${escapeXML(client.name)}</text><text x="28" y="514" fill="#7d806f" font-size="12" font-family="sans-serif">有限的花材，无限的心意。 · MARKET BOUQUET</text>`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 540" role="img" aria-label="${escapeXML(client.name)}的花束，${list.length}枝花">${content}</svg>`;
}
