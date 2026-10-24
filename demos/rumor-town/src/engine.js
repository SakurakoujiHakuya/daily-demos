export const PEOPLE=[['阿禾','面包店',100,130],['舟舟','码头',300,75],['小岚','书摊',500,130],['木叔','钟楼',650,270],['阿星','花铺',530,420],['米姨','茶馆',310,470],['豆子','修车铺',100,400],['青禾','邮局',315,275]];
const common=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0],[0,7],[2,7],[5,7]];
export const SCENARIOS=[
 {id:'bridge',title:'第一期 · 桥还会开吗',subtitle:'一张旧告示，让明天的赶集变成了疑问。',claim:'镇上的石桥明天起永久封闭。',truth:'明天只封闭西侧步道两小时，东侧仍可通行。',edges:common,initial:[-70,-55,-40,-65,-20,-50,-30,-45],event:{tick:7,node:3,text:'码头传来一张没有日期的旧截图，木叔又起了疑虑。'},sources:[{id:'notice',name:'桥边新告示',hint:'现场 · 有日期',valid:true,text:'本周六 08:00—10:00 修缮西侧步道，东侧照常开放。'},{id:'archive',name:'抽屉里的剪报',hint:'档案 · 日期待核',valid:false,text:'去年的暴雨封桥通知，不能证明明天的安排。'},{id:'keeper',name:'值班员的排班表',hint:'当日 · 可交叉核对',valid:true,text:'东侧引导岗位明天正常值班，西侧修缮只有两小时。'}]},
 {id:'lantern',title:'第二期 · 灯会取消了吗',subtitle:'两条街的消息没有对上，一盏灯被传成整个夜晚。',claim:'今年的灯会全部取消了。',truth:'河边一组灯暂停展出，广场灯会仍按时举行。',edges:[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[2,7]],initial:[-80,-65,-50,-40,-75,-55,-60,-45],event:{tick:8,node:5,text:'一句“那组灯不开了”脱离上下文传进茶馆。'},sources:[{id:'square',name:'广场节目单',hint:'今年 · 演出信息',valid:true,text:'本周灯会节目和场地已确认，只标注河边一组灯暂停。'},{id:'old',name:'去年撤场记录',hint:'档案 · 可能过期',valid:false,text:'去年的撤场记录与今年的安排无关。'},{id:'crew',name:'布展组的记录',hint:'今日 · 现场清单',valid:true,text:'广场各组灯完成布展，河边一组仍在检修。'}]},
 {id:'library',title:'第三期 · 书会被丢掉吗',subtitle:'从一句话到整条街，省略掉的条件越来越多。',claim:'图书馆要把所有旧书丢掉。',truth:'旧书正在分类修补；破损无法修复的少量重复本单独处理。',edges:[[0,7],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[0,1],[2,3],[4,5]],initial:[-60,-85,-70,-45,-65,-80,-50,-65],event:{tick:6,node:7,text:'邮局收到一句被截短的转述，中心节点再次动摇。'},sources:[{id:'repair',name:'修补工作台',hint:'现场 · 正在进行',valid:true,text:'大部分旧书正在修补装订，完成后回到书架。'},{id:'list',name:'分类登记簿',hint:'本周 · 可核数量',valid:true,text:'仅少量无法修复的重复本单列，其他书籍保留。'},{id:'quote',name:'无署名的便条',hint:'转述 · 缺上下文',valid:false,text:'“旧书都处理一下”没有说明如何处理，不足以支持传闻。'}]}
];
export const MAX_TICKS=14;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function createState(id='bridge'){const s=SCENARIOS.find(x=>x.id===id);if(!s)throw Error('Unknown scenario');return {scenario:id,tick:0,beliefs:[...s.initial],trust:70,ink:6,inspected:[],evidence:[],log:[],history:[],ended:false};}
export function neighbors(s,n){return SCENARIOS.find(x=>x.id===s.scenario).edges.flatMap(([a,b])=>a===n?[b]:b===n?[a]:[]);}
export function stats(s){const settled=s.beliefs.filter(v=>v>=35).length;const worried=s.beliefs.filter(v=>v<=-35).length;return {settled,worried,uncertain:8-settled-worried,score:Math.round(settled*10+s.trust/5+s.ink*2),win:settled>=6&&s.trust>=50&&s.evidence.length>=2};}
export function label(v){return v>=35?'依据已明':v<=-35?'相信传闻':'仍在观望';}
export function snapshot(s){const {history,...rest}=s;return structuredClone(rest);}
export function act(state,action){if(state.ended)return {state,error:'本期已截稿。可以撤回或重新开局。'};const c=SCENARIOS.find(x=>x.id===state.scenario);const node=action.node;
if(['publish','reassure','listen'].includes(action.type)&&(!Number.isInteger(node)||node<0||node>7))return {state,error:'先选择地图中的一位居民。'};
if(action.type==='publish'&&state.evidence.length<2)return {state,error:'先交叉核实两份有效来源，再发布更正。'};
if(['publish','reassure'].includes(action.type)&&state.ink===0)return {state,error:'纸墨已用完。可以倾听、观察或撤回。'};
if(action.type==='inspect'&&(!c.sources.find(x=>x.id===action.source)||state.inspected.includes(action.source)))return {state,error:'这份来源已查过，或不存在。'};
if(!['publish','reassure','listen','inspect','wait'].includes(action.type))return {state,error:'未知行动。'};
const s=structuredClone(state);s.history.push(snapshot(state));s.tick++;let text='';
if(action.type==='inspect'){const src=c.sources.find(x=>x.id===action.source);s.inspected.push(src.id);if(src.valid)s.evidence.push(src.id);text=`查阅「${src.name}」：${src.valid?'取得有效依据。':'过期或缺少上下文，不能作依据。'}`;}
if(action.type==='publish'){s.ink--;s.beliefs[node]=100;for(const n of neighbors(s,node))s.beliefs[n]=clamp(s.beliefs[n]+65,-100,100);s.trust=clamp(s.trust+3,0,100);text=`向${PEOPLE[node][0]}送达附两份来源的更正，邻居同步收到来源。`;}
if(action.type==='reassure'){s.ink--;for(const n of [node,...neighbors(s,node)])s.beliefs[n]=clamp(s.beliefs[n]+18,-100,100);s.trust=clamp(s.trust-12,0,100);text=`向${PEOPLE[node][0]}发送无依据的安慰；短暂缓和，但编辑部可信度下降。`;}
if(action.type==='listen'){s.beliefs[node]=clamp(s.beliefs[node]+8,-100,100);s.trust=clamp(s.trust+4,0,100);text=`倾听${PEOPLE[node][0]}的疑问，让对话保留余地。`;}
if(action.type==='wait')text='观察一轮，消息继续沿邻里关系流动。';
const before=[...s.beliefs];s.beliefs=before.map((v,i)=>{const ns=neighbors(s,i),avg=ns.reduce((a,n)=>a+before[n],0)/ns.length;return Math.round(clamp(v+(avg-v)*.12,-100,100));});
if(s.tick===c.event.tick){s.beliefs[c.event.node]=Math.max(-90,s.beliefs[c.event.node]-65);text+=' '+c.event.text;}
s.log.push({tick:s.tick,action:structuredClone(action),text,beliefs:[...s.beliefs],trust:s.trust,ink:s.ink});s.ended=s.tick>=MAX_TICKS;return {state:s,error:null};}
export function undo(s){if(!s.history.length)return s;return {...structuredClone(s.history.at(-1)),history:s.history.slice(0,-1)};}
export function play(id,actions){return actions.reduce((s,a)=>act(s,a).state,createState(id));}
export function restore(value){try{if(!value||!Array.isArray(value.log)||value.log.length>14||!SCENARIOS.some(c=>c.id===value.scenario))return null;let s=createState(value.scenario);for(const item of value.log){const r=act(s,item.action);if(r.error)return null;s=r.state;}return s;}catch{return null;}}
