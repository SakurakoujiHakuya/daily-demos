export const TIDES=[0,0,1,2,2,1];
export const ACTIONS={N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]};
// # sea; . land; = middle shoal; ~ low-only shoal; H home; R shelter.
export const LEVELS=[
 {id:'morning',name:'01 · 晨汐短笺',subtitle:'两封信，一条会消失的路',limit:45,par:36,stamina:9,grid:['#######','#H.=A##','##.####','##~####','##R==B#','#######'],letters:{A:{name:'灯塔守望人',text:'雾散之后，不必急着回答。灯还亮着。'},B:{name:'修船的阿婆',text:'船已补好，等一个风小的早晨。'}}},
 {id:'fork',name:'02 · 岛间折返',subtitle:'先走哪一岸，决定下一次涨潮',limit:65,par:44,stamina:10,grid:['#########','#A=R=.=B#','###~#.###','#H..R...#','#####~###','#####C###','#########'],letters:{A:{name:'盐田少年',text:'你寄来的种子，已经在窗边发芽。'},B:{name:'海鸟观察员',text:'有一只鸟，每次都比潮水早回来。'},C:{name:'南岸画家',text:'画里没有人，但给你留了一把椅子。'}}},
 {id:'night',name:'03 · 暮色回航',subtitle:'低潮不是捷径，休息也占一拍',limit:75,par:42,stamina:9,grid:['#########','#H.=R==A#','#.#~###.#','#R~=B~.R#','###.###~#','#C==R...#','#########'],letters:{A:{name:'北灯台',text:'今晚换我值夜，你可以早点回家。'},B:{name:'潮间小屋',text:'有些等待不是空白，是潮水正在转身。'},C:{name:'旧码头',text:'最后一封信送到后，请记得也把自己带回来。'}}}
];
export const tideAt=t=>TIDES[((t%6)+6)%6];
export const cellAt=(l,x,y)=>l.grid[y]?.[x]??'#';
export const isSafe=(c,t)=>c!=='#'&&(c==='~'?tideAt(t)===0:c==='='?tideAt(t)<=1:true);
export function locate(l,char){for(let y=0;y<l.grid.length;y++){const x=l.grid[y].indexOf(char);if(x>=0)return{x,y};}return null;}
export function createState(l){return {...locate(l,'H'),turn:0,energy:l.stamina,delivered:[],status:'playing',message:'从邮局出发。先看下一拍，再踩上浅滩。',trail:[],lastDelivery:null};}
export function step(l,s,a){
 if(s.status!=='playing')return s;
 let x=s.x,y=s.y,energy=s.energy-1;const t=s.turn+1;let verb='等候一拍';
 if(a==='rest'){if(!['H','R'].includes(cellAt(l,x,y)))return {...s,message:'只能在邮局或避潮亭歇脚。'};energy=Math.min(l.stamina,s.energy+4);verb='歇脚补充4点体力';}
 else if(ACTIONS[a]){x+=ACTIONS[a][0];y+=ACTIONS[a][1];verb='走过一格';if(!isSafe(cellAt(l,x,y),t))return {...s,message:'下一拍这里会被潮水覆盖，或不是可走的路。行动未消耗。'};}
 else if(a!=='wait')return s;
 const n={...s,x,y,turn:t,energy,delivered:[...s.delivered],trail:[...s.trail,{x:s.x,y:s.y}],lastDelivery:null,message:verb};
 if(!isSafe(cellAt(l,x,y),t)){n.status='lost';n.message='潮水漫过脚下的浅滩。撤回一步，换条路或提前离开。';return n;}
 if(energy<0){n.status='lost';n.message='体力耗尽，邮袋还没有送完。撤回并在避潮亭歇脚。';return n;}
 const c=cellAt(l,x,y);if(l.letters[c]&&!n.delivered.includes(c)){n.delivered.push(c);n.lastDelivery=c;n.message=`已送达：${l.letters[c].name}。${n.delivered.length===Object.keys(l.letters).length?'所有信已送出，现在返回邮局。':'还有信等着你。'}`;}
 if(c==='H'&&n.delivered.length===Object.keys(l.letters).length){n.status='won';n.message='信已抵达，你也平安回到邮局。';}
 else if(t>=l.limit){n.status='lost';n.message='夜航收班了。撤回、重排路线，再试一次。';}
 return n;
}
export function solve(l,start=createState(l)){
 if(start.status==='won')return[];if(start.status!=='playing')return null;
 const clean={...start,trail:[]};const q=[{s:clean,path:[]}],seen=new Set();let head=0;
 while(head<q.length){const {s,path}=q[head++];const key=[s.x,s.y,s.turn%6,s.energy,[...s.delivered].sort().join('')].join(',');if(seen.has(key))continue;seen.add(key);
 for(const a of [...Object.keys(ACTIONS),'wait','rest']){const n=step(l,s,a);if(n.turn===s.turn||n.status==='lost')continue;if(n.status==='won')return [...path,a];q.push({s:{...n,trail:[]},path:[...path,a]});}}
 return null;
}
export function stars(l,s){return s.status==='won'?(s.turn<=l.par?3:s.turn<=l.par+8?2:1):0;}
