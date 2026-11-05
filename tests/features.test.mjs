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
