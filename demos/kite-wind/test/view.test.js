import test from 'node:test';
import assert from 'node:assert/strict';
import {targetLayers} from '../src/view.js';
import {SCENARIOS} from '../src/engine.js';
for(const [id,config] of Object.entries(SCENARIOS)) {
  test(`${id}: active target is last painted at each stage`,()=>{
    for(let i=0;i<4;i++) {
      const layers=targetLayers(config.targets,i);
      assert.equal(layers.at(-1).index,i);
      assert.equal(layers.at(-1).showLabel,true);
      assert.equal(layers.length,4);
    }
  });
}
test('coast overlapping future and completed labels cannot cover active target',()=>{
  assert.equal(targetLayers(SCENARIOS.coast.targets,0).find(x=>x.index===2).showLabel,false);
  assert.equal(targetLayers(SCENARIOS.coast.targets,2).find(x=>x.index===0).showLabel,false);
});
test('finished route keeps all completion marks',()=>{
  assert.ok(targetLayers(SCENARIOS.coast.targets,4).every(x=>x.showLabel));
});
