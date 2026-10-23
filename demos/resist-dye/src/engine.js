export const SIZE=16;
export const COLORS=['#f2e9d2','#b6cbd1','#729cac','#386a86','#173d62'];
export function blank(){return {dye:Array(SIZE*SIZE).fill(0),wax:Array(SIZE*SIZE).fill(false),dips:0};}
export function valid(s){return !!s&&Array.isArray(s.dye)&&s.dye.length===256&&s.dye.every(v=>Number.isInteger(v)&&v>=0&&v<=4)&&Array.isArray(s.wax)&&s.wax.length===256&&s.wax.every(v=>typeof v==='boolean')&&Number.isInteger(s.dips)&&s.dips>=0;}
export function mirrors(index,mode='none'){if(!Number.isInteger(index)||index<0||index>=256)return [];let r=Math.floor(index/SIZE),c=index%SIZE;let coords=[[r,c]];if(mode==='vertical'||mode==='four')coords.push([r,15-c]);if(mode==='horizontal'||mode==='four')coords.push([15-r,c]);if(mode==='four')coords.push([15-r,15-c]);return [...new Set(coords.map(([y,x])=>y*SIZE+x))];}
export function paint(s,index,on=true,mode='none',radius=0){let n=structuredClone(s);let y=Math.floor(index/16),x=index%16;if(!Number.isInteger(index)||index<0||index>=256)return n;for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){let yy=y+dy,xx=x+dx;if(yy>=0&&yy<16&&xx>=0&&xx<16)for(const i of mirrors(yy*16+xx,mode))n.wax[i]=on;}return n;}
export function dip(s){return {...structuredClone(s),dye:s.dye.map((v,i)=>s.wax[i]?v:Math.min(4,v+1)),dips:s.dips+1};}
export function dewax(s){return {...structuredClone(s),wax:Array(256).fill(false)};}
const grid=fn=>Array.from({length:256},(_,i)=>fn(Math.floor(i/16),i%16));
export const COMMISSIONS=[
{id:'stream',name:'01 · 溪流围巾',subtitle:'留白的节奏',brief:'交替的两列留白与两列中蓝，像水面慢慢展开的波纹。',target:grid((r,c)=>c%4<2?0:2),limit:2,recipe:'给第 1–2、5–6、9–10、13–14 列上蜡；浸染两次；脱蜡。'},
{id:'window',name:'02 · 夜窗方巾',subtitle:'时间藏在染层里',brief:'奶白边框、浅蓝窗心与中蓝夜色。先后上蜡，才能保留不同的时间。',target:grid((r,c)=>(r<2||r>13||c<2||c>13)?0:(r>=5&&r<=10&&c>=5&&c<=10)?1:2),limit:2,recipe:'先给最外两圈上蜡，浸染一次；再给中央 6×6 窗心上蜡，浸染一次；脱蜡。'},
{id:'cross',name:'03 · 交会桌旗',subtitle:'对称不等于重复',brief:'深蓝底上留下四格宽的十字。尝试四向对称，只画四分之一。',target:grid((r,c)=>(r>=6&&r<=9||c>=6&&c<=9)?0:3),limit:3,recipe:'给中央第 7–10 行和第 7–10 列上蜡；浸染三次；脱蜡。'}];
export function assess(s,target,limit){let error=s.dye.reduce((sum,v,i)=>sum+Math.abs(v-target[i]),0);let exact=s.dye.filter((v,i)=>v===target[i]).length;let wax=s.wax.filter(Boolean).length;let score=Math.round(100*(1-error/1024));return {score,exact,wax,complete:exact===256&&wax===0,efficient:s.dips<=limit};}
export function svg(s){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 552"><rect width="512" height="552" fill="#f2e9d2"/>${s.dye.map((v,i)=>`<rect x="${i%16*32}" y="${Math.floor(i/16)*32}" width="32" height="32" fill="${COLORS[v]}"/>`).join('')}<text x="256" y="538" text-anchor="middle" fill="#173d62" font-family="serif" font-size="16">蓝染实验室 · ORIGINAL CLOTH</text></svg>`;}
