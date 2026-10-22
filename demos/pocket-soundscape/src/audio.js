// All timbres are generated locally. No samples, microphones, or network requests.
export class SoundEngine {
 constructor(){this.context=null;this.master=null;this.voices=new Set();}
 async enable(){
  if(!this.context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('当前浏览器没有 Web Audio');this.context=new Audio();this.master=this.context.createGain();const limiter=this.context.createDynamicsCompressor();limiter.threshold.value=-18;limiter.ratio.value=8;this.master.connect(limiter);limiter.connect(this.context.destination);}
  if(this.context.state==='suspended')await this.context.resume();if(this.context.state!=='running')throw Error('浏览器未允许音频播放');
 }
 setVolume(v){if(this.master)this.master.gain.setTargetAtTime(v*.6,this.context.currentTime,.02);}
 silence(){for(const voice of this.voices){try{voice.stop();}catch{}}this.voices.clear();}
 hit(track,velocity,volume,pitch){
  if(!this.context||this.context.state!=='running')return;
  const ctx=this.context,t=ctx.currentTime,power=(velocity===2?1:.55)*volume,ratio=2**(pitch/12);
  const tone=(freq,dur,gain,type='sine',end=null)=>{const osc=ctx.createOscillator(),env=ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq*ratio,t);if(end)osc.frequency.exponentialRampToValueAtTime(end*ratio,t+dur);env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(Math.max(.0002,gain*power),t+.006);env.gain.exponentialRampToValueAtTime(.0001,t+dur);osc.connect(env);env.connect(this.master);osc.start(t);osc.stop(t+dur+.01);this.voices.add(osc);osc.onended=()=>{this.voices.delete(osc);osc.disconnect();env.disconnect();};};
  const noise=(dur,freq,q,gain)=>{const size=Math.ceil(ctx.sampleRate*dur),buffer=ctx.createBuffer(1,size,ctx.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<size;i++)data[i]=Math.random()*2-1;const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),env=ctx.createGain();source.buffer=buffer;filter.type='bandpass';filter.frequency.value=freq;filter.Q.value=q;env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(Math.max(.0002,gain*power),t+.01);env.gain.exponentialRampToValueAtTime(.0001,t+dur);source.connect(filter);filter.connect(env);env.connect(this.master);source.start(t);this.voices.add(source);source.onended=()=>{this.voices.delete(source);source.disconnect();filter.disconnect();env.disconnect();};};
  if(track===0){tone(130,.22,.7,'sine',42);noise(.045,500,.5,.12);}
  if(track===1){tone(2200,.09,.1);tone(3150,.07,.06);noise(.04,4000,3,.13);}
  if(track===2)noise(.2,5200,.6,.3);
  if(track===3){tone(523.25,.8,.18);tone(1046.5,.35,.04);}
  if(track===4){tone(783.99,.7,.12);tone(1174.66,.5,.09);}
  if(track===5)noise(.13,1800,.8,.4);
 }
}
