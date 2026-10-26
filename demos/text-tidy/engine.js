export const PRESETS={gentle:{trim:true,spaces:false,blanks:true,join:false,bullets:false},pdf:{trim:true,spaces:false,blanks:true,join:true,bullets:false},list:{trim:true,spaces:false,blanks:true,join:false,bullets:true}};
const listLine=s=>/^\s*(?:[-*•·▪◦]|\d+[.)、]|[一二三四五六七八九十]+[、.])\s*/u.test(s);
const heading=s=>/^\s*(?:#{1,6}\s|第.+[章节]|[一二三四五六七八九十]+、)/u.test(s)||/[:：]$/u.test(s.trim());
const cjk=c=>/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u.test(c||'');
export function tidy(input,options={}){
 const o={...PRESETS.gentle,...options};let lines=String(input).replace(/\r\n?/g,'\n').split('\n');
 if(o.trim)lines=lines.map(x=>x.replace(/^[\t \u3000]+|[\t \u3000]+$/g,''));
 if(o.spaces)lines=lines.map(x=>x.replace(/[\t \u3000 ]+/g,' '));
 if(o.bullets)lines=lines.map(x=>x.replace(/^(\s*)[\-*•·▪◦]\s*/u,'$1- '));
 if(o.join){const joined=[];for(const line of lines){const prev=joined.at(-1);if(prev&&line&&!listLine(prev)&&!listLine(line)&&!heading(prev)&&!heading(line)&&!/[。！？!?；;]$/u.test(prev)){joined[joined.length-1]=prev+((cjk(prev.at(-1))||cjk(line[0]))?'':' ')+line;}else joined.push(line);}lines=joined;}
 if(o.spaces)lines=lines.map(x=>x.replace(/[\t \u3000 ]+/g,' '));
 if(o.blanks){const out=[];for(const line of lines){if(line.trim()||out.at(-1)!=='')out.push(line.trim()?line:'');}while(out[0]==='')out.shift();while(out.at(-1)==='')out.pop();lines=out;}
 return lines.join('\n');
}
export function stats(a,b){const al=a.replace(/\r\n?/g,'\n').split('\n'),bl=b.split('\n');return {before:[...a].length,after:[...b].length,linesBefore:a?al.length:0,linesAfter:b?bl.length:0,changed:a!==b,changedLines:al.reduce((n,x,i)=>n+(x!==bl[i]?1:0),0)+Math.max(0,bl.length-al.length)};}
export const SAMPLES={gentle:'  周末见面笔记  \n\n  地点：河边咖啡馆  \n  时间：周六 14:00  \n\n\n  记得带上那本书。  \n',pdf:'这座城市的清晨，\n从一杯热茶开始。\n\n沿着河岸慢慢走，\n会看见旧书店刚刚开门。\n\n随身物品：\n• 水杯\n• 一本书',list:'  周末采购  \n\n• 燕麦\n* 咖啡豆\n▪ 苹果\n\n\n备注：保留编号与内容。\n1. 先看家里库存\n2. 再去超市'};
