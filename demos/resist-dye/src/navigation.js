import {SIZE} from './engine.js';
// Arrow movement never wraps or jumps along an edge. Null means unhandled input.
export function navigateCell(index,key){
  if(!Number.isInteger(index)||index<0||index>=SIZE*SIZE)return null;
  const row=Math.floor(index/SIZE),column=index%SIZE;
  if(key==='ArrowLeft')return column>0?index-1:index;
  if(key==='ArrowRight')return column<SIZE-1?index+1:index;
  if(key==='ArrowUp')return row>0?index-SIZE:index;
  if(key==='ArrowDown')return row<SIZE-1?index+SIZE:index;
  return null;
}
