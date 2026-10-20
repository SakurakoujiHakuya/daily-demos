import {TYPES,SAMPLES,MAX_EXHIBITS,typeFor,normalizeExhibit,validateExhibit,parseCollection,serializeCollection,upsertExhibit} from './model.mjs';
import {artwork,artworkData} from './art.mjs';
const $=id=>document.getElementById(id);
const STORAGE='ordinary-museum:v1';
let mine=[],hall='samples',selected=0,editingId=null,toastTimer;
try{mine=parseCollection(localStorage.getItem(STORAGE));}catch{}
const list=()=>hall==='samples'?SAMPLES:mine;
const current=()=>list()[selected];
function announce(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,4500);}
function save(){try{localStorage.setItem(STORAGE,serializeCollection(mine));return true;}catch{announce('浏览器未允许保存；本次内容仍可查看，请立即备份收藏。');return false;}}
function scrollToDetail(){requestAnimationFrame(()=>$('detail').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'}));}
function render(){
 const items=list();selected=Math.max(0,Math.min(selected,items.length-1));
 $('mine-count').textContent=String(mine.length).padStart(2,'0');
 for(const [id,value] of [['sample-tab','samples'],['mine-tab','mine']]){$(id).classList.toggle('active',hall===value);$(id).setAttribute('aria-pressed',String(hall===value));}
 $('hall-note').textContent=hall==='samples'?'展签均为原创虚构故事，不代表你的经历':'本机私藏 · 只在当前浏览器保存，不会上传';
 $('shelf').replaceChildren();
 items.forEach((item,i)=>{const button=document.createElement('button');button.type='button';button.className='shelf-item'+(i===selected?' selected':'');button.setAttribute('aria-pressed',String(i===selected));button.setAttribute('aria-label',`查看展品：${item.title}`);const number=document.createElement('span');number.className='item-number';number.textContent=`NO. ${String(i+1).padStart(3,'0')}`;const art=document.createElement('div');art.innerHTML=artwork(item.type,{label:false});const title=document.createElement('span');title.className='item-name';title.textContent=item.title;button.append(number,art,title);button.addEventListener('click',()=>{selected=i;render();scrollToDetail();});button.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();selected=(i+(event.key==='ArrowRight'?1:-1)+items.length)%items.length;render();$('shelf').children[selected].focus();}});$('shelf').append(button);});
 $('empty-state').hidden=items.length>0;$('detail').hidden=items.length===0;$('shelf').hidden=items.length===0;
 if(!items.length)return;
 const item=current(),type=typeFor(item.type);$('accession').textContent=`${hall==='samples'?'ARCHIVE':'PERSONAL'} / ${String(selected+1).padStart(3,'0')}`;$('object-type').textContent=type.english;
 $('object-art').innerHTML=artwork(item.type);$('material-caption').textContent=type.material;
 $('slide-count').textContent=`${String(selected+1).padStart(2,'0')} / ${String(items.length).padStart(2,'0')}`;
 $('detail-provenance').textContent=hall==='samples'?'常设展 · 虚构展签':'我的收藏 · 私人展签';
 for(const key of ['title','year','material','place','story','trace'])$('detail-'+key).textContent=item[key]||({year:'年份不详',material:'未标注',place:'未标注',trace:'有些细节，留白也很好。'}[key]||'');
 $('create-from').textContent=hall==='samples'?'我也有这样的物件 ↗':'编辑这张展签 ↗';$('delete').hidden=hall==='samples';
}
function setHall(value){hall=value;selected=0;render();}
$('sample-tab').addEventListener('click',()=>setHall('samples'));$('mine-tab').addEventListener('click',()=>setHall('mine'));
function advance(n){if(!list().length)return;selected=(selected+n+list().length)%list().length;render();}
$('previous').addEventListener('click',()=>advance(-1));$('next').addEventListener('click',()=>advance(1));
TYPES.forEach(type=>{const label=document.createElement('label');label.className='type-option';const input=document.createElement('input');input.type='radio';input.name='type';input.value=type.id;input.required=true;const text=document.createElement('span');text.textContent=type.name;label.append(input,text);$('type-options').append(label);});
function openEditor(item=null,type='key'){
 if(!item&&mine.length>=MAX_EXHIBITS){announce('展厅已满（12 件），请先在“我的收藏”移出一件。');return;}
 editingId=item?.id||null;$('exhibit-form').reset();$('form-error').textContent='';
 $('editor-title').textContent=item?'重新读一读它的故事。':'让它有一个位置。';
 $('exhibit-form').elements.type.value=item?.type||type;
 for(const key of ['title','year','material','place','story','trace'])$(key).value=item?.[key]||'';
 $('story-count').textContent=`${$('story').value.length} / 240`;
 $('editor').showModal();$('editor').scrollTop=0;requestAnimationFrame(()=>$('title').focus());
}
$('open-create').addEventListener('click',()=>openEditor());$('empty-create').addEventListener('click',()=>openEditor());$('create-from').addEventListener('click',()=>openEditor(hall==='mine'?current():null,current()?.type));$('close-editor').addEventListener('click',()=>$('editor').close());
$('story').addEventListener('input',()=>$('story-count').textContent=`${$('story').value.length} / 240`);
$('exhibit-form').addEventListener('submit',event=>{event.preventDefault();const data=Object.fromEntries(new FormData(event.currentTarget));data.id=editingId||`object-${crypto.randomUUID()}`;const error=validateExhibit(data);if(error){$('form-error').textContent=error;return;}try{mine=upsertExhibit(mine,data);}catch(error){$('form-error').textContent=error.message;return;}const saved=save();hall='mine';selected=mine.findIndex(item=>item.id===data.id);render();$('editor').close();scrollToDetail();if(saved)announce(editingId?'展签已更新。':'已入藏。平凡之物，现在有了它的位置。');});
$('delete').addEventListener('click',()=>$('remove-dialog').showModal());$('cancel-remove').addEventListener('click',()=>$('remove-dialog').close());$('confirm-remove').addEventListener('click',()=>{if(hall!=='mine'||!current())return;mine=mine.filter(item=>item.id!==current().id);const saved=save();$('remove-dialog').close();render();if(saved)announce('已移出当前收藏。');});
function download(blob,filename){const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=filename;link.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
$('backup').addEventListener('click',()=>{if(!mine.length){announce('还没有个人收藏，先入藏一件物品吧。');return;}download(new Blob([serializeCollection(mine)],{type:'application/json'}),'ordinary-museum-collection.json');announce('收藏备份已下载，妥善保存这份 JSON 文件。');});
$('restore').addEventListener('click',()=>$('import-file').click());
$('import-file').addEventListener('change',async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;if(file.size>128*1024){announce('文件太大，请选择本展厅导出的收藏备份（128 KB 以内）。');return;}try{const imported=parseCollection(await file.text());if(!imported.length){announce('没有找到有效展品，请使用本展厅导出的 JSON 备份。');return;}const existing=new Set(mine.map(e=>e.id));const additions=imported.filter(e=>!existing.has(e.id));const free=MAX_EXHIBITS-mine.length;const added=additions.slice(0,free);mine=[...mine,...added];const saved=save();hall='mine';selected=0;render();if(saved)announce(`已导入 ${added.length} 件；${imported.length-added.length} 件重复或超出容量，原收藏未覆盖。`);}catch{announce('无法读取这个文件，请重试有效的收藏备份。');}});
function wrapText(ctx,text,maxWidth){const lines=[];for(const paragraph of text.split('\n')){let line='';for(const char of Array.from(paragraph)){if(line&&ctx.measureText(line+char).width>maxWidth){lines.push(line);line=char;}else line+=char;}lines.push(line);}return lines;}
function textBlock(ctx,text,x,y,width,lineHeight,maxLines){const lines=wrapText(ctx,text,width);lines.slice(0,maxLines).forEach((line,i)=>ctx.fillText(i===maxLines-1&&lines.length>maxLines?line.slice(0,-1)+'…':line,x,y+i*lineHeight));return y+Math.min(lines.length,maxLines)*lineHeight;}
$('export').addEventListener('click',async()=>{const item=current();if(!item)return;const button=$('export');button.disabled=true;const before=button.textContent;button.textContent='正在装裱…';try{await document.fonts.ready;const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=1600;const ctx=canvas.getContext('2d');ctx.fillStyle='#f4f0e7';ctx.fillRect(0,0,1200,1600);ctx.strokeStyle='#c9c8b9';ctx.strokeRect(48,48,1104,1504);ctx.fillStyle='#797b70';ctx.font='18px monospace';ctx.fillText('MUSEUM OF ORDINARY THINGS',88,108);ctx.textAlign='right';ctx.fillText('ARCHIVE / '+String(selected+1).padStart(3,'0'),1112,108);ctx.textAlign='left';const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=artworkData(item.type);});ctx.drawImage(img,325,130,550,520);ctx.fillStyle='#aa5039';ctx.font='19px sans-serif';ctx.fillText(hall==='samples'?'常设展 · 原创虚构展签':'我的收藏 · 私人展签',88,698);ctx.textAlign='right';ctx.fillText(item.year||'年份不详',1112,698);ctx.textAlign='left';ctx.fillStyle='#2e342f';ctx.font='48px "Songti SC", "Noto Serif CJK SC", serif';let y=textBlock(ctx,item.title,88,766,1024,67,2);ctx.strokeStyle='#c9c8b9';ctx.beginPath();ctx.moveTo(88,y+8);ctx.lineTo(1112,y+8);ctx.stroke();ctx.fillStyle='#797b70';ctx.font='20px sans-serif';y+=48;textBlock(ctx,`材质：${item.material||'未标注'}  /  地点：${item.place||'未标注'}`,88,y,1024,32,2);y+=85;ctx.fillStyle='#2e342f';ctx.font='29px "Songti SC", "Noto Serif CJK SC", serif';y=textBlock(ctx,item.story,88,y,1024,49,7);if(item.trace&&y<1370){ctx.fillStyle='#797b70';ctx.font='21px sans-serif';textBlock(ctx,`留存的痕迹 / ${item.trace}`,88,Math.max(y+30,1310),1024,35,2);}ctx.fillStyle='#aa5039';ctx.font='26px "Songti SC", serif';ctx.fillText('平凡之物，也有来处。',88,1476);ctx.fillStyle='#797b70';ctx.font='16px monospace';ctx.textAlign='right';ctx.fillText('日常物证馆 / DAILY DEMOS',1112,1476);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG unavailable');download(blob,'ordinary-museum-exhibit.png');announce('1200 × 1600 展品海报已下载。');}catch{announce('海报暂时未能导出。文字仍在，可稍后重试或先备份收藏。');}finally{button.disabled=false;button.textContent=before;}});
render();
