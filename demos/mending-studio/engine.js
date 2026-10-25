/** Pure stitching rules. Coordinates are [column, row], 0..4. */
export const SIZE = 4;
export const COMMISSIONS = [
  { id:'cuff', title:'袖口的四道裂纹', subtitle:'01 / 第一件旧衣', garment:'靛蓝工装衬衫', story:'花店的阿姨送来一件穿了七年的衬衫。袖口磨破了，她说：不用藏起来，缝得像一排小花就好。', brief:'沿一排裂口来回行针，每格至少缝住两边。', start:[0,1], end:[4,1], targets:[{x:0,y:1,need:2},{x:1,y:1,need:2},{x:2,y:1,need:2},{x:3,y:1,need:2}], blocked:[], thread:10,tension:8, mood:'平针 · 轻巧', hint:'先向下走一格，再沿裂口上下交替。相邻裂口可以共享一条边。', solutions:[[[0,1],[0,2],[1,2],[1,1],[2,1],[2,2],[3,2],[3,1],[4,1]],[[0,1],[1,1],[1,2],[2,2],[2,1],[3,1],[3,2],[4,2],[4,1]]] },
  { id:'pocket', title:'口袋的两座小岛', subtitle:'02 / 给重物一点支撑', garment:'苔绿帆布围裙', story:'修自行车的叔叔总把零件塞进口袋。这一次，不只缝住裂口，还要给两处受力的布料各留三道支撑。', brief:'两处裂口各需三边。灰色扣带不能穿针。', start:[0,2],end:[4,2],targets:[{x:1,y:1,need:3},{x:2,y:2,need:3}],blocked:[[[2,1],[3,1]],[[1,3],[2,3]]],thread:12,tension:9,mood:'回环 · 稳固',hint:'让线绕过第一座小岛的上方，再绕第二座的下方，像两个方向相反的 U。',solutions:[[[0,2],[1,2],[1,1],[2,1],[2,2],[2,3],[3,3],[3,2],[4,2]],[[0,2],[1,2],[1,1],[2,1],[2,2],[3,2],[3,3],[2,3],[2,4],[3,4],[4,4],[4,3],[4,2]]] },
  { id:'coat', title:'风衣上的远行地图', subtitle:'03 / 把弯路留下来', garment:'沙色旧风衣', story:'旅行者的风衣有四处破损，像地图上散落的岛屿。她想带着它继续走，让每一道针脚都成为下一程的路标。', brief:'轻裂口缝两边，深裂口缝三边；留意两条旧扣带。',start:[0,0],end:[4,4],targets:[{x:0,y:0,need:2},{x:2,y:0,need:3},{x:1,y:2,need:3},{x:3,y:3,need:2}],blocked:[[[2,1],[2,2]],[[3,2],[3,3]]],thread:16,tension:11,mood:'绕行 · 从容',hint:'先照顾上排两处裂口，再从右侧折回左下的深裂口。最后沿下方走向右下角。',solutions:[[[0,0],[1,0],[1,1],[2,1],[2,0],[3,0],[3,1],[3,2],[2,2],[1,2],[1,3],[2,3],[3,3],[4,3],[4,4]],[[0,0],[1,0],[1,1],[2,1],[2,0],[3,0],[3,1],[3,2],[2,2],[1,2],[1,3],[2,3],[3,3],[3,4],[4,4]]] }
];
export const same = (a,b) => !!a && !!b && a[0]===b[0] && a[1]===b[1];
export const pointName = p => `${String.fromCharCode(65+p[0])}${p[1]+1}`;
export const edgeKey = (a,b) => [a.join(','),b.join(',')].sort().join('|');
export const validPoint = p => Array.isArray(p)&&p.length===2&&p.every(v=>Number.isInteger(v)&&v>=0&&v<=SIZE);
export const freshState = () => ({path:[],submitted:false});
export const freeCommission = () => ({id:'free',title:'自由补丁',subtitle:'没有标准答案',garment:'你的布片',story:'留一点线，给自己的想法。选择「编辑裂口」，点布格设置两边或三边的加固目标；再从任意针点出发。',brief:'任意起针、任意收针。点布格设计自己的裂口。',start:null,end:null,targets:[{x:1,y:1,need:2},{x:2,y:2,need:3}],blocked:[],thread:40,tension:28,mood:'随手 · 自由',hint:'可以在布格中设计裂口，也可以清空裂口只画一段连续针迹。'});
export function analyze(config,path){
  const edges=new Set();let turns=0,revisits=0;
  path.forEach((p,i)=>{if(i){edges.add(edgeKey(path[i-1],p));if(path.slice(0,i).some(q=>same(p,q)))revisits++;}if(i>1){const a=path[i-2],b=path[i-1];if(b[0]-a[0]!==p[0]-b[0]||b[1]-a[1]!==p[1]-b[1])turns++;}});
  const cells=config.targets.map(c=>{const {x,y}=c;const sides=[[[x,y],[x+1,y]],[[x+1,y],[x+1,y+1]],[[x,y+1],[x+1,y+1]],[[x,y],[x,y+1]]];const count=sides.filter(([a,b])=>edges.has(edgeKey(a,b))).length;return {...c,count,done:count>=c.need};});
  const used=Math.max(0,path.length-1),tension=turns+revisits*2,covered=cells.filter(c=>c.done).length;
  const reachedEnd=config.end?same(path.at(-1),config.end):path.length>1;
  const complete=path.length>1&&covered===cells.length&&reachedEnd&&used<=config.thread&&tension<=config.tension;
  return {used,turns,revisits,tension,cells,covered,total:cells.length,reachedEnd,complete,edges};
}
export function move(config,state,point){
  const fail=error=>({ok:false,error,state});
  if(!validPoint(point))return fail('针点不在布面上。');
  if(state.submitted)return fail('这件补丁已收好。撤销或重新起针，再试一种走法。');
  if(!state.path.length){if(config.start&&!same(point,config.start))return fail(`先在 ${pointName(config.start)} 的「起」针点落针。`);return {ok:true,state:{path:[[...point]],submitted:false},error:null};}
  const last=state.path.at(-1);if(same(last,point))return fail('这是当前针点；请选择相邻的针点。');
  if(Math.abs(last[0]-point[0])+Math.abs(last[1]-point[1])!==1)return fail('线不能跳格或斜穿，请选择上下左右相邻的针点。');
  const key=edgeKey(last,point),stats=analyze(config,state.path);
  if(stats.edges.has(key))return fail('这条边已经有线了。用「撤销一针」退回，不要重复走线。');
  if(config.blocked.some(([a,b])=>edgeKey(a,b)===key))return fail('灰色扣带挡住了这条边，请绕行。');
  const path=[...state.path,[...point]],next=analyze(config,path);
  if(next.used>config.thread)return fail('线不够长了。撤销几针，换一条更短的路。');
  if(next.tension>config.tension)return fail('布料绷得太紧了。少拐弯、少重复经过针点。');
  return {ok:true,state:{path,submitted:false},error:null};
}
export function undo(state){return {path:state.path.slice(0,-1),submitted:false};}
export function submit(config,state){const stats=analyze(config,state.path);if(!stats.complete){let reason=!state.path.length?'先落下第一针。':stats.covered<stats.total?`还有 ${stats.total-stats.covered} 处裂口没有缝牢。`:!stats.reachedEnd?(config.end?`把线继续送到 ${pointName(config.end)} 的「收」针点。`:'至少缝一条边，才能收针。'):'请检查线长与张力。';return {ok:false,state,error:reason};}return {ok:true,state:{...state,submitted:true},error:null};}
export function cycleTarget(config,x,y){if(config.id!=='free'||!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>=SIZE||y>=SIZE)return config;const found=config.targets.find(c=>c.x===x&&c.y===y);return {...config,targets:[...config.targets.filter(c=>c!==found),...(!found?[{x,y,need:2}]:found.need===2?[{x,y,need:3}]:[])]};}
export function runPath(config,path){let state=freshState();for(const p of path){const result=move(config,state,p);if(!result.ok)return result;state=result.state;}return {...submit(config,state),stats:analyze(config,state.path)};}
