import {SOURCES, normalizeState} from './engine.js';
const isRecord=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const knownSource=id=>SOURCES.some(source=>source.id===id);
function normalizeDraft(value, sourceId){
  if(!isRecord(value)||!isRecord(value.state)||!knownSource(value.state.sourceId))return null;
  if(sourceId&&value.state.sourceId!==sourceId)return null;
  return {state:normalizeState(value.state),title:typeof value.title==='string'?value.title.slice(0,30):'未命名的留白'};
}
// Always reconstruct records: arrays accept named properties but JSON silently drops them.
export function normalizeStore(value){
  const result={auto:{},drafts:[],current:'station'};
  if(!isRecord(value))return result;
  if(knownSource(value.current))result.current=value.current;
  if(isRecord(value.auto))for(const {id} of SOURCES){
    if(!Object.hasOwn(value.auto,id))continue;
    const draft=normalizeDraft(value.auto[id],id);
    if(draft)result.auto[id]=draft;
  }
  if(Array.isArray(value.drafts))for(const valueDraft of value.drafts){
    const draft=normalizeDraft(valueDraft);
    if(!draft||typeof valueDraft.id!=='string'||!valueDraft.id||result.drafts.some(x=>x.id===valueDraft.id))continue;
    result.drafts.push({...draft,id:valueDraft.id,createdAt:typeof valueDraft.createdAt==='string'?valueDraft.createdAt:''});
    if(result.drafts.length===12)break;
  }
  return result;
}
