import test from 'node:test';
import assert from 'node:assert/strict';
import {navigateCell} from '../src/navigation.js';

test('top and bottom edges preserve column, including reported regressions',()=>{
  assert.equal(navigateCell(7,'ArrowUp'),7);
  assert.equal(navigateCell(242,'ArrowDown'),242);
  for(let column=0;column<16;column++){
    assert.equal(navigateCell(column,'ArrowUp'),column);
    assert.equal(navigateCell(240+column,'ArrowDown'),240+column);
  }
});
test('left and right edges do not wrap',()=>{
  for(let row=0;row<16;row++){
    assert.equal(navigateCell(row*16,'ArrowLeft'),row*16);
    assert.equal(navigateCell(row*16+15,'ArrowRight'),row*16+15);
  }
});
test('all interior moves preserve the other coordinate',()=>{
  for(let i=0;i<256;i++){
    if(i>=16)assert.equal(navigateCell(i,'ArrowUp'),i-16);
    if(i<240)assert.equal(navigateCell(i,'ArrowDown'),i+16);
    if(i%16>0)assert.equal(navigateCell(i,'ArrowLeft'),i-1);
    if(i%16<15)assert.equal(navigateCell(i,'ArrowRight'),i+1);
  }
});
test('other keys and invalid cells remain unhandled',()=>{
  for(const key of ['Enter',' ','Tab','a'])assert.equal(navigateCell(7,key),null);
  for(const i of [-1,256,NaN,1.5])assert.equal(navigateCell(i,'ArrowUp'),null);
});
