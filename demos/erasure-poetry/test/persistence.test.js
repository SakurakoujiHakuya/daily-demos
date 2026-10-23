import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeStore} from '../src/persistence.js';
import {sampleState} from '../src/engine.js';
const draft=id=>({state:sampleState(id),title:'我的留白'});
test('array auto maps are replaced and new named drafts survive JSON round-trip',()=>{
  const array=[];array.station=draft('station');
  const store=normalizeStore({auto:array,current:'room'});
  assert.deepEqual(store.auto,{});assert.equal(Array.isArray(store.auto),false);
  store.auto.room=draft('room');
  assert.deepEqual(normalizeStore(JSON.parse(JSON.stringify(store))).auto.room,draft('room'));
});
test('malformed root and auto records normalize to fresh ordinary maps',()=>{
  for(const value of [null,[],true,'bad',42,{auto:[]},{auto:null},{auto:'bad'}])assert.deepEqual(normalizeStore(value).auto,{});
  assert.notEqual(normalizeStore(null).auto,normalizeStore(null).auto);
});
test('valid auto drafts remain independent, normalized and source-key matched',()=>{
  const input={auto:{station:draft('station'),room:draft('room'),market:draft('station'),unknown:draft('room')},current:'room'};
  const store=normalizeStore(input);
  assert.deepEqual(Object.keys(store.auto),['station','room']);assert.equal(store.current,'room');
  assert.deepEqual(store.auto.station,draft('station'));assert.notEqual(store.auto,input.auto);
  assert.notEqual(store.auto.station.state.selected,input.auto.station.state.selected);
});
test('auto map drops inherited, array, malformed and unknown-source entries',()=>{
  const auto=Object.create({station:draft('station')});auto.room=[];auto.market={state:{sourceId:'bad'}};
  assert.deepEqual(normalizeStore({auto,current:'bad'}),{auto:{},drafts:[],current:'station'});
});
test('saved collections reject array entries and duplicate or absent IDs',()=>{
  const good={...draft('market'),id:'one',createdAt:'2026-10-23'};
  const store=normalizeStore({drafts:[[],null,{},draft('room'),good,good]});
  assert.deepEqual(store.drafts,[good]);assert.deepEqual(normalizeStore({drafts:{one:good}}).drafts,[]);
});
test('collection limits and titles survive sanitized persistence round-trip',()=>{
  const store=normalizeStore({drafts:Array.from({length:20},(_,i)=>({...draft('room'),id:String(i),title:'字'.repeat(50)}))});
  assert.equal(store.drafts.length,12);assert.equal(store.drafts[0].title.length,30);
  assert.deepEqual(normalizeStore(JSON.parse(JSON.stringify(store))),store);
});
