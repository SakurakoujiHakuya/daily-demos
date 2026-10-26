export const MAX_PIXELS = 24000000;
export const MAX_BYTES = 25000000;
export function dimensions(width,height,targetWidth){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<1||height<1) throw new Error('无法读取图片尺寸');
 const w=Math.max(1,Math.min(Math.round(Number(targetWidth)||width),width,8192));
 return {width:w,height:Math.max(1,Math.round(height*w/width))};
}
export function formatBytes(n){if(!Number.isFinite(n)||n<0)return '—';return n<1000?`${n} B`:n<1000000?`${(n/1000).toFixed(1)} KB`:`${(n/1000000).toFixed(2)} MB`;}
export function changeLabel(before,after){if(!before)return '—';const pct=Math.abs(after-before)/before*100;const n=after<before&&pct>99?Math.min(99.9,Math.round(pct*10)/10):Math.round(pct);return after===before?'体积不变':after<before?`减少 ${n}%`:`增大 ${n}%`;}
export function outputName(name,mime){const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[mime]||'png';return (name.replace(/\.[^.]*$/,'')||'image')+'-light.'+ext;}
export function validateFile(file){if(file.size>MAX_BYTES)throw new Error('图片超过 25 MB，请选择较小的文件');if(!['image/png','image/jpeg','image/webp','image/avif','image/gif','image/bmp'].includes(file.type))throw new Error('请选择 PNG、JPEG、WebP、AVIF、GIF 或 BMP 图片');}
