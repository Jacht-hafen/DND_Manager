import {test} from 'node:test';import {strict as assert} from 'node:assert';import {applyAction,defaultData,PUZZLES} from '../netlify/functions/engine.mjs';
const room=puzzle=>({puzzle,phase:'playing',theme:'ember',data:defaultData(),players:[{id:'a',role:'a'},{id:'b',role:'b'},{id:'c',role:'c'}]});
const player=role=>({id:role,role});
test('runes cooperate / roles protected',()=>{let r=room('runes');assert.throws(()=>applyAction(r,player('b'),{type:'step',value:2}));for(const v of [2,0,4,1])r=applyAction(r,player('a'),{type:'step',value:v});assert(r.data.solved.includes('runes'))});
test('wrong lever order resets',()=>{let r=room('levers');for(const v of [0,1,2,3,4,5])r=applyAction(r,player('a'),{type:'step',value:v});assert.deepEqual(r.data.steps,[]);assert.equal(r.data.attempts,1)});
test('three unique roles needed',()=>{let r=room('pressure');for(const role of ['a','b'])r=applyAction(r,player(role),{type:'plate',value:true});assert(!r.data.solved.includes('pressure'));r=applyAction(r,player('c'),{type:'plate',value:true});assert(r.data.solved.includes('pressure'))});
test('only DM can select puzzle',()=>{assert.throws(()=>applyAction(room('runes'),player('a'),{type:'select',puzzle:'mirrors'}));assert.equal(applyAction(room('runes'),player('dm'),{type:'select',puzzle:'mirrors'}).puzzle,'mirrors')});
test('all puzzle identifiers distinct',()=>assert.equal(new Set(PUZZLES.map(x=>x.id)).size,PUZZLES.length));
