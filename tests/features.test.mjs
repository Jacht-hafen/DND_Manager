import test from 'node:test';
import assert from 'node:assert/strict';
import {applyAction,defaultData} from '../netlify/functions/engine.mjs';
const room=()=>({puzzle:'runes',phase:'playing',data:defaultData(),players:[{id:'a',role:'a'},{id:'b',role:'b'}]});
test('only DM can send hints',()=>{
 const r=room();
 assert.throws(()=>applyAction(r,{id:'a',role:'a'},{type:'hint',text:'Achte auf die Symbole'}));
 const result=applyAction(r,{id:'dm',role:'dm'},{type:'hint',text:'Achte auf die Symbole'});
 assert(result.data.events.some(e=>e.message.includes('Hinweis vom DM:')));
});
test('hints reject oversized text',()=>{
 assert.throws(()=>applyAction(room(),{id:'dm',role:'dm'},{type:'hint',text:'x'.repeat(281)}));
});
test('DM can solve a custom puzzle',()=>{
 const r=room();r.puzzle='custom';r.data.custom={id:'example',title:'Beispiel',description:'Text'};
 const out=applyAction(r,{id:'dm',role:'dm'},{type:'solve'});
 assert(out.data.solved.includes('custom'));
});

test('hints remain available to players and reset clears previous hints',()=>{
  const r=room(),dm={id:'dm',role:'dm'};
  const hinted=applyAction(r,dm,{type:'hint',text:'Die dritte Rune ist wichtig'});
  assert(hinted.data.events.some(e=>e.type==='hint'&&e.message.includes('dritte Rune')));
  const reset=applyAction(hinted,dm,{type:'reset'});
  assert.equal(reset.data.events.some(e=>e.type==='hint'),false);
});
test('players can reset lever selections without resetting the entire room',()=>{
  const r=room();r.puzzle='levers';r.data.steps=['4','0'];r.data.attempts=2;
  const updated=applyAction(r,{id:'a',role:'a'},{type:'reset-steps'});
  assert.deepEqual(updated.data.steps,[]);
  assert.equal(updated.data.attempts,2);
  assert.equal(updated.phase,'playing');
});
test('lever reset is forbidden outside the lever puzzle',()=>{
  assert.throws(()=>applyAction(room(),{id:'a',role:'a'},{type:'reset-steps'}));
});
test('switching puzzles clears old DM hints',()=>{
  const r=room();r.data.events=[{type:'hint',message:'Alter Tipp',at:Date.now()}];
  const updated=applyAction(r,{id:'dm',role:'dm'},{type:'select',puzzle:'levers'});
  assert.equal(updated.data.events.some(e=>e.type==='hint'),false);
});
