import test from 'node:test';import assert from 'node:assert/strict';import {dimensions,formatBytes,changeLabel,outputName,validateFile} from '../engine.js';
test('dimensions keeps ratio and never upscales',()=>{assert.deepEqual(dimensions(1800,1200,640),{width:640,height:427});assert.deepEqual(dimensions(500,1000,2000),{width:500,height:1000});assert.deepEqual(dimensions(10000,5000,10000),{width:8192,height:4096});});
test('tiny images and invalid metadata',()=>{assert.deepEqual(dimensions(3,1,1),{width:1,height:1});assert.throws(()=>dimensions(0,100,1));assert.throws(()=>dimensions(NaN,100,1));});
test('bytes show useful scales',()=>{assert.equal(formatBytes(0),'0 B');assert.equal(formatBytes(500),'500 B');assert.equal(formatBytes(1500),'1.5 KB');assert.equal(formatBytes(2300000),'2.30 MB');assert.equal(formatBytes(NaN),'—')});
test('honest size feedback for larger outputs',()=>{assert.equal(changeLabel(1000,200),'减少 80%');assert.equal(changeLabel(1000,1200),'增大 20%');assert.equal(changeLabel(100,100),'体积不变');});
test('actual MIME controls extension',()=>{assert.equal(outputName('my.photo.webp','image/png'),'my.photo-light.png');assert.equal(outputName('风景.png','image/jpeg'),'风景-light.jpg');assert.equal(outputName('image','image/webp'),'image-light.webp');});
test('file guard rejects oversized/nonimages and allows advertised raster formats',()=>{for(const type of ['image/png','image/jpeg','image/webp','image/avif','image/gif','image/bmp'])assert.doesNotThrow(()=>validateFile({type,size:100}));assert.throws(()=>validateFile({type:'image/svg+xml',size:1}));assert.throws(()=>validateFile({type:'image/png',size:25000001}));assert.doesNotThrow(()=>validateFile({type:'image/png',size:25000000}));});
test('aspect ratio property across portrait/landscape dimensions',()=>{for(let w=1;w<1000;w+=57)for(let h=1;h<1000;h+=79){const d=dimensions(w,h,200);assert.ok(d.width<=w);assert.ok(d.height>=1);assert.ok(d.height===Math.max(1,Math.round(h*d.width/w)))}});

test('nonzero outputs never claim 100 percent reduction',()=>{assert.equal(changeLabel(1000000,1),'减少 99.9%')});

test('replacement failure retains error after restoring previous result',async()=>{const {readFile}=await import('node:fs/promises');const source=await readFile(new URL('../app.js',import.meta.url),'utf8');assert.match(source,/if\(source\)await render\(\);error\(message\)/)});
