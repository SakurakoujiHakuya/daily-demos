export const COLORS=['陶土','海蓝','日金'];
const mod=n=>((n%4)+4)%4;
export const rotate=(tile,turns=1)=>({...tile,edges:tile.edges.map((_,i)=>tile.edges[mod(i-turns)])});
export const cloneBoard=b=>b.map(t=>({...t,edges:[...t.edges]}));
const neighbor=(i,d,n)=>{const r=Math.floor(i/n),c=i%n;return d===0?(r?i-n:-1):d===1?(c<n-1?i+1:-1):d===2?(r<n-1?i+n:-1):(c?i-1:-1);};
function createLevel(id,n,title,subtitle,path,seed,scramble){
 const tiles=Array.from({length:n*n},(_,i)=>({id:i+1,edges:[0,0,0,0]}));let x=seed;
 const random=()=>{x=(x*1664525+1013904223)>>>0;return x%3;};
 for(let i=0;i<tiles.length;i++) for(const d of [1,2]){const j=neighbor(i,d,n);if(j>=0) tiles[i].edges[d]=tiles[j].edges[(d+2)%4]=random();}
 for(let k=0;k<path.length-1;k++){const a=path[k],b=path[k+1],d=[0,1,2,3].find(d=>neighbor(a,d,n)===b);tiles[a].edges[d]=tiles[b].edges[(d+2)%4]=1;}
 const gates=[{index:path[0],side:3,name:'海港入口'},{index:path.at(-1),side:1,name:'灯塔出口'}];for(const g of gates)tiles[g.index].edges[g.side]=1;
 let initial=cloneBoard(tiles);for(const a of scramble){if(a[0]==='r')initial[a[1]]=rotate(initial[a[1]],a[2]);else [initial[a[1]],initial[a[2]]]=[initial[a[2]],initial[a[1]]];}
 return {id,n,title,subtitle,solution:tiles,initial,gates,scramble};
}
export const LEVELS=[
 createLevel('harbour',3,'01 · 海港小径','九块瓷砖，接回第一条海蓝色小路。',[0,1,4,3,6,7,8],31,[['r',1,1],['r',4,2],['s',0,8],['r',7,3],['s',2,5]]),
 createLevel('courtyard',4,'02 · 柠檬庭院','十六块瓷砖。边缘相合，还不等于整条路接通。',[4,5,1,2,6,10,9,13,14,15],71,[['s',0,10],['r',2,1],['s',5,14],['r',9,2],['s',1,15],['r',12,3],['s',3,8],['r',6,1],['r',11,2]]),
 createLevel('lantern',4,'03 · 灯塔回廊','在弯折的蓝线里，找到属于自己的另一种解。',[8,9,5,4,0,1,2,6,7,11,10,14,15],97,[['r',0,1],['s',1,12],['r',3,2],['s',4,15],['r',7,3],['s',6,10],['r',9,1],['s',2,14],['r',11,2],['s',5,13],['r',8,3],['r',15,1]])
];
export function analyze(board,level){
 const {n,gates}=level;const conflicts=[],matched=[];let total=0;
 for(let i=0;i<board.length;i++)for(let d=0;d<4;d++){
  const j=neighbor(i,d,n);if(j>=0&&d!==1&&d!==2)continue;total++;
  const expected=j<0?(gates.some(g=>g.index===i&&g.side===d)?1:0):board[j].edges[(d+2)%4];
  (board[i].edges[d]===expected?matched:conflicts).push({i,d,j});
 }
 const start=gates[0],end=gates[1],visited=new Set(),queue=[];
 if(board[start.index].edges[start.side]===1){queue.push(start.index);visited.add(start.index);}
 while(queue.length){const i=queue.shift();for(let d=0;d<4;d++){const j=neighbor(i,d,n);if(j>=0&&board[i].edges[d]===1&&board[j].edges[(d+2)%4]===1&&!visited.has(j)){visited.add(j);queue.push(j);}}}
 const connected=visited.has(end.index)&&board[end.index].edges[end.side]===1;
 return {conflicts,matched,total,connected,visited:[...visited],won:conflicts.length===0&&connected};
}
export function initialState(levelIndex=0,free=false){const level=LEVELS[levelIndex]||LEVELS[0];return {version:1,levelIndex:LEVELS.indexOf(level),free,board:cloneBoard(level.initial),moves:0,history:[],hints:0};}
export function change(state,action){
 const n=state.board.length;let board=cloneBoard(state.board);
 if(action.type==='rotate'&&Number.isInteger(action.index)&&action.index>=0&&action.index<n){board[action.index]=rotate(board[action.index],action.turns===-1?-1:1);}
 else if(action.type==='swap'&&[action.a,action.b].every(i=>Number.isInteger(i)&&i>=0&&i<n)&&action.a!==action.b){[board[action.a],board[action.b]]=[board[action.b],board[action.a]];}
 else if(action.type==='paint'&&state.free&&Number.isInteger(action.index)&&action.index>=0&&action.index<n&&Number.isInteger(action.side)&&action.side>=0&&action.side<4){board[action.index].edges[action.side]=(board[action.index].edges[action.side]+1)%3;}
 else return state;
 return {...state,board,moves:state.moves+1,history:[...state.history.slice(-199),{board:cloneBoard(state.board),moves:state.moves}]};
}
export function undo(state){if(!state.history.length)return state;const previous=state.history.at(-1);return {...state,board:cloneBoard(previous.board),moves:previous.moves,history:state.history.slice(0,-1)};}
export function restore(raw){try{const s=JSON.parse(raw);if(s.version!==1||!Number.isInteger(s.levelIndex)||!LEVELS[s.levelIndex]||typeof s.free!=='boolean')return null;const len=LEVELS[s.levelIndex].n**2;const valid=b=>Array.isArray(b)&&b.length===len&&new Set(b.map(t=>t.id)).size===len&&b.every(t=>Number.isInteger(t.id)&&t.id>=1&&t.id<=len&&Array.isArray(t.edges)&&t.edges.length===4&&t.edges.every(c=>[0,1,2].includes(c)));if(!valid(s.board)||!Number.isSafeInteger(s.moves)||s.moves<0)return null;return {...s,history:Array.isArray(s.history)?s.history.filter(h=>valid(h.board)&&Number.isSafeInteger(h.moves)&&h.moves>=0).slice(-200):[],hints:Number.isSafeInteger(s.hints)&&s.hints>=0?s.hints:0};}catch{return null;}}
export function inverseSolution(level){return [...level.scramble].reverse().flatMap(([t,a,b])=>t==='s'?[{type:'swap',a,b}]:Array.from({length:mod(-b)},()=>({type:'rotate',index:a})));}
