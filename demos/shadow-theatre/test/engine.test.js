import test from 'node:test';import assert from 'node:assert/strict';import {ACTS,createState,project,targets,evaluate,change,restore,hint,clone} from '../engine.js';
for(let i=0;i<ACTS.length;i++){
 test(`act ${i+1} starts unsolved`,()=>assert.equal(evaluate(createState(i)).solved,false));
 test(`act ${i+1} exact reference solution is 100%`,()=>{const s=createState(i);s.light=clone(ACTS[i].solution.light);s.objects=clone(ACTS[i].solution.objects);assert.equal(evaluate(s).score,100);assert.equal(evaluate(s).solved,true);});
 test(`act ${i+1} reference solution reachable through controls`,()=>{let s=createState(i);for(const k of ['u','v'])s=change(s,'light',k,ACTS[i].solution.light[k]);for(const o of ACTS[i].solution.objects)for(const k of ['u','v','z','angle'])s=change(s,o.id,k,o[k]);assert.equal(evaluate(s).solved,true);assert.equal(evaluate(s).stars,3);});
 test(`act ${i+1} initial save roundtrip`,()=>{const s=createState(i);assert.deepEqual(restore(JSON.stringify(s)),s);});
}
test('projection is a point-light similar-triangle calculation',()=>{assert.deepEqual(project({u:10,v:5,z:50,r:8,angle:15},{u:2,v:1}),{u:18,v:9,r:16,angle:15,scale:2});});
test('closer paper gives larger shadow',()=>assert.ok(project({u:0,v:0,z:30,r:8,angle:0},{u:0,v:0}).r>project({u:0,v:0,z:80,r:8,angle:0},{u:0,v:0}).r));
test('lamp translation changes every object in shared stage',()=>{const s=createState(1),m=change(s,'light','u',8);for(const o of s.objects)assert.notEqual(project(o,s.light).u,project(o,m.light).u);});
test('first lamp is fixed in puzzle mode',()=>{const s=createState();assert.equal(change(s,'light','u',10),s);});
test('first lamp can move in free mode',()=>assert.equal(change(createState(0,true),'light','u',10).light.u,10));
test('clamp invalid depth and coordinates',()=>{let s=change(createState(),'bird','z',-300);assert.equal(s.objects[0].z,30);s=change(s,'bird','u',900);assert.equal(s.objects[0].u,35);});
test('invalid target/key/value has no effect',()=>{const s=createState();assert.equal(change(s,'x','u',0),s);assert.equal(change(s,'bird','r',100),s);assert.equal(change(s,'bird','u',NaN),s);});
test('updates do not mutate past state',()=>{const s=createState();const before=JSON.stringify(s);const next=change(s,'bird','z',60);assert.equal(JSON.stringify(s),before);assert.equal(next.moves,1);});
test('unchanged values do not spend a move',()=>{const s=createState();assert.equal(change(s,'bird','z',40),s);});
test('a wrong angle is not solved even if position and size match',()=>{const s=createState();s.objects=clone(ACTS[0].solution.objects);s.objects[0].angle+=30;assert.equal(evaluate(s).solved,false);});
test('generous but bounded exact-match tolerance',()=>{const s=createState();s.objects=clone(ACTS[0].solution.objects);s.objects[0].u+=.5;s.objects[0].angle+=5;assert.equal(evaluate(s).solved,true);s.objects[0].u+=3;assert.equal(evaluate(s).solved,false);});
test('hints graduate and stop at reference solution',()=>{let s=createState();for(let i=0;i<5;i++){const h=hint(s);s=h.state;if(i>=2)assert.match(h.text,/参考解/);}assert.equal(s.hints,3);});
test('bad saved data does not execute or restore',()=>{for(const v of ['undefined','{}','null','<script>','[]'])assert.equal(restore(v),null);const s=createState();s.objects[0].z=0;assert.equal(restore(JSON.stringify(s)),null);});
test('unknown metadata cannot alter original content',()=>{const s=createState();s.objects[0].name='<img onerror=alert(1)>';assert.equal(restore(JSON.stringify(s)),null);});
test('targets stay independent from mutable stage',()=>{const s=createState(),t=targets(s);s.objects[0].u=35;assert.deepEqual(targets(s),t);});
test('restored locked-light puzzle cannot contain moved lamp',()=>{const s=createState();s.light.u=5;assert.equal(restore(JSON.stringify(s)),null);s.free=true;assert.ok(restore(JSON.stringify(s)));});
