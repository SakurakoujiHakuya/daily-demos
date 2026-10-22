export const TRACKS = [
  { id:'step', name:'巷口脚步', icon:'◈', note:'低频的脚步，给街道一个心跳', color:'#f3af58' },
  { id:'key', name:'钥匙轻碰', icon:'✧', note:'短促金属声，像开门前的一瞬', color:'#f3d297' },
  { id:'rain', name:'窗边细雨', icon:'⋮', note:'滤波噪声，留下细碎的空气', color:'#74b6bb' },
  { id:'glass', name:'杯沿回响', icon:'◇', note:'柔和正弦音，向夜色敲一个音符', color:'#a89bd0' },
  { id:'bell', name:'单车铃声', icon:'⌁', note:'双音的清亮回声，穿过街角', color:'#d18c8f' },
  { id:'paper', name:'翻页沙沙', icon:'≋', note:'短噪声与起伏包络，纸页般的节奏', color:'#9db58b' }
];
export const ARRANGEMENTS = { A:['A'], B:['B'], AB:['A','B'], AABB:['A','A','B','B'] };
export function blankPattern(){ return TRACKS.map(()=>Array(16).fill(0)); }
export function createSong(){ return {version:1,title:'我的窗边一刻',bpm:96,swing:0.12,master:0.55,arrangement:'AB',patterns:{A:blankPattern(),B:blankPattern()},tracks:TRACKS.map(()=>({volume:0.7,mute:false,solo:false})),pitch:0}; }
export const clone = x => JSON.parse(JSON.stringify(x));
export function cycleCell(song,pattern,track,step){
 if(!song.patterns[pattern] || !Number.isInteger(track)||track<0||track>=6||!Number.isInteger(step)||step<0||step>15) throw Error('无效的节拍位置');
 const next=clone(song); next.patterns[pattern][track][step]=(next.patterns[pattern][track][step]+1)%3; return next;
}
export function duration(bpm,swing,step){ return (60/bpm/4)*(step%2===0?1+swing:1-swing); }
export function position(absolute,arrangement){ const sequence=ARRANGEMENTS[arrangement]; if(!sequence || !Number.isInteger(absolute)||absolute<0)throw Error('无效播放位置'); return {pattern:sequence[Math.floor(absolute/16)%sequence.length],step:absolute%16,bar:Math.floor(absolute/16)}; }
export function activeTracks(song){ const solo= song.tracks.some(t=>t.solo); return song.tracks.map(t=>!t.mute&&(!solo||t.solo)); }
export function density(song,p){ return song.patterns[p].flat().filter(Boolean).length; }
function fill(song,p,t,steps,v=1){for(const s of steps)song.patterns[p][t][s]=v;}
export function preset(name){ const s=createSong();
 if(name==='rain'){s.title='雨停之前';s.bpm=82;s.swing=.08;fill(s,'A',0,[0,8],2);fill(s,'A',2,[0,2,4,6,8,10,12,14]);fill(s,'A',3,[3,11]);fill(s,'A',5,[6,14]);s.patterns.B=clone(s.patterns.A);fill(s,'B',4,[15]);fill(s,'B',3,[7],2);}
 else if(name==='walk'){s.title='晚归的步伐';s.bpm=112;s.swing=.22;fill(s,'A',0,[0,4,8,12],2);fill(s,'A',1,[2,6,10,14]);fill(s,'A',5,[4,12]);fill(s,'A',4,[7]);s.patterns.B=clone(s.patterns.A);fill(s,'B',0,[11]);fill(s,'B',1,[13,15],2);fill(s,'B',4,[15]);}
 else if(name==='read'){s.title='最后一页灯光';s.bpm=68;s.swing=0;fill(s,'A',3,[0,6,10]);fill(s,'A',5,[4,12]);fill(s,'A',2,[7,15]);fill(s,'A',0,[8]);s.patterns.B=clone(s.patterns.A);fill(s,'B',3,[14],2);fill(s,'B',4,[2]);}
 else throw Error('未知声景'); return s;
}
export function validateSong(input){
 if(!input||typeof input!=='object'||input.version!==1)throw Error('不是支持的声景文件');
 const num=(x,min,max)=> typeof x==='number'&&Number.isFinite(x)&&x>=min&&x<=max;
 if(!num(input.bpm,50,160)||!num(input.swing,0,.45)||!num(input.master,0,1)||!Number.isInteger(input.pitch)||input.pitch< -5||input.pitch>5)throw Error('速度、摇摆或音量超出范围');
 if(!Object.hasOwn(ARRANGEMENTS,input.arrangement))throw Error('段落顺序无效');
 if(typeof input.title!=='string'||input.title.length>60)throw Error('标题须在60个字以内');
 for(const p of ['A','B']){const rows=input.patterns?.[p];if(!Array.isArray(rows)||rows.length!==6||rows.some(r=>!Array.isArray(r)||r.length!==16||r.some(v=>![0,1,2].includes(v))))throw Error('节拍网格不完整');}
 if(!Array.isArray(input.tracks)||input.tracks.length!==6||input.tracks.some(t=>!t||!num(t.volume,0,1)||typeof t.mute!=='boolean'||typeof t.solo!=='boolean'))throw Error('音轨设置无效');
 const s=createSong();for(const k of ['title','bpm','swing','master','arrangement','pitch'])s[k]=input[k];s.patterns=clone(input.patterns);s.tracks=input.tracks.map(t=>({volume:t.volume,mute:t.mute,solo:t.solo}));return s;
}
export function rotatePattern(song,p,amount=1){const s=clone(song);s.patterns[p]=s.patterns[p].map(row=>row.map((_,i)=>row[(i-amount%16+16)%16]));return s;}
