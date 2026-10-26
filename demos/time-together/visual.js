import {ZONES, localParts} from './engine.js';
const cityColors=['#345BCD','#B83C62','#087B77','#8650B7','#B65B17','#44748C','#8B527E','#456C38','#9D4C29','#4A56A3','#236C84','#586279'];
export function cityColor(zone){const i=ZONES.findIndex(([z])=>z===zone);return cityColors[i<0?cityColors.length-1:i];}
export function clockPeriod(ms,zone){const minute=localParts(ms,zone).minute;return minute>=420&&minute<1140?'day':'night';}
export function contrast(a,b){const lum=h=>{const c=h.replace('#','').match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722};const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
