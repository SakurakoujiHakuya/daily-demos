export const TYPES = [
  {id:'key', name:'钥匙', english:'KEY', material:'黄铜 / 金属', color:'#806246'},
  {id:'ticket', name:'车票', english:'TICKET', material:'纸 / 油墨', color:'#5e7772'},
  {id:'cup', name:'杯子', english:'CUP', material:'陶瓷 / 时间', color:'#b2694d'},
  {id:'umbrella', name:'雨伞', english:'UMBRELLA', material:'织物 / 金属', color:'#586a7b'},
  {id:'receipt', name:'小票', english:'RECEIPT', material:'热敏纸 / 字迹', color:'#8b7954'},
  {id:'cassette', name:'磁带', english:'CASSETTE', material:'塑料 / 磁性带', color:'#8e5e64'},
];
export const SAMPLES = [
  {id:'sample-key',type:'key',title:'已经搬走的家的钥匙',year:'2018',place:'玄关最下面的抽屉',material:'黄铜，齿口磨损',story:'它再也打不开现在的任何一扇门。\n但握在掌心里，回家的动作仍然完整。',trace:'钥匙圈上，留着一圈比金属更浅的颜色。'},
  {id:'sample-ticket',type:'ticket',title:'没有赶上的末班车',year:'2021',place:'一本书的第 47 页',material:'纸，边角折痕',story:'车早就开走了。\n后来等到天亮，才发现那晚还有另一条回家的路。',trace:'目的地还看得清，出发时间已经褪色。'},
  {id:'sample-cup',type:'cup',title:'杯口缺了一小块的星期天',year:'2023',place:'窗边的第二块瓷砖',material:'白瓷，细小缺口',story:'买了新的杯子以后，这一只被用来养薄荷。\n原来有些东西不必修好，也能继续留下。',trace:'一道浅浅的茶渍，记录着它以前的工作。'},
  {id:'sample-umbrella',type:'umbrella',title:'借来的那场雨',year:'2020',place:'门后的挂钩',material:'尼龙，一根弯曲的伞骨',story:'伞没还成，人也不再遇见。\n只有下雨时，它还会把两个人的距离重新撑开。',trace:'握柄上贴着一颗快要掉下来的星星。'},
  {id:'sample-receipt',type:'receipt',title:'两个人的一份早餐',year:'2024',place:'旧钱包的透明夹层',material:'热敏纸，逐渐消失的字',story:'账单只记了豆浆和两个包子。\n没有记下那天，我们在路边聊到早餐变凉。',trace:'总计一栏淡得几乎看不见了。'},
  {id:'sample-cassette',type:'cassette',title:'B 面最后一首歌',year:'1999',place:'贴着姓名的纸盒',material:'磁带，手写标签',story:'歌名已经忘了，前奏之前的那声轻响却记得。\n有些年代，靠杂音也能辨认。',trace:'标签上的字歪向右边，像总想再快一点长大。'},
];
export const MAX_EXHIBITS = 12;
export function typeFor(id) { return TYPES.find(t=>t.id===id)||TYPES[0]; }
export function cleanText(value,max) { return typeof value==='string'?value.trim().slice(0,max):''; }
export function normalizeExhibit(raw={}) { return {id:cleanText(raw.id,80),type:typeFor(raw.type).id,title:cleanText(raw.title,32),year:cleanText(raw.year,18),place:cleanText(raw.place,40),material:cleanText(raw.material,40),story:cleanText(raw.story,240),trace:cleanText(raw.trace,80)}; }
export function validateExhibit(raw) { const e=normalizeExhibit(raw); if(!e.title) return '请给这件物品一个展品名称。'; if(!e.story) return '请写下一点它值得被留下的原因。'; return ''; }
export function parseCollection(serialized) { try { const v=JSON.parse(serialized); if(!v||v.version!==1||!Array.isArray(v.exhibits)) return []; const seen=new Set(); return v.exhibits.slice(0,MAX_EXHIBITS).map(normalizeExhibit).filter(e=>{if(!e.id||seen.has(e.id)||validateExhibit(e))return false;seen.add(e.id);return true;}); }catch{return [];} }
export function serializeCollection(exhibits) { return JSON.stringify({version:1,exhibits:exhibits.slice(0,MAX_EXHIBITS).map(normalizeExhibit)}); }
export function upsertExhibit(collection,raw) { const e=normalizeExhibit(raw); const error=validateExhibit(e); if(error)throw new Error(error); if(!e.id)throw new Error('展品编号不能为空。'); const i=collection.findIndex(item=>item.id===e.id); if(i<0&&collection.length>=MAX_EXHIBITS)throw new Error('展厅最多陈列 12 件物品，请先移出一件。'); const next=collection.map(item=>({...item})); if(i<0) next.push(e); else next[i]=e;return next; }
export function escapeXml(str) { return String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c])); }
