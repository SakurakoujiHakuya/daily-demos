import test from 'node:test';import assert from 'node:assert/strict';import {compose,moments,moods,images,wrapText} from '../src/poem.mjs';
test('every combination produces four original template lines',()=>{for(const moment of Object.keys(moments))for(const mood of Object.keys(moods))for(const image of Object.keys(images)){const poem=compose({moment,mood,image});assert.equal(poem.split('\n').length,4);assert.ok(!poem.includes('undefined'));}});
test('deterministic, varied and bounded',()=>{assert.equal(compose({variant:7}),compose({variant:7}));assert.notEqual(compose({variant:0}),compose({variant:1}));assert.equal(compose({variant:135}),compose({variant:0}));});
test('rejects invalid input',()=>{assert.throws(()=>compose({moment:'bad'}));assert.throws(()=>compose({variant:-1}));});
test('wraps Unicode without splitting surrogate pairs',()=>assert.deepEqual(wrapText('😀😀\n你好世界',s=>Array.from(s).length,2),['😀😀','你好','世界']));
test('preserves blank lines',()=>assert.deepEqual(wrapText('a\n\nb',s=>s.length,10),['a','','b']));
