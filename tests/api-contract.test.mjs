import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/functions/api.mjs';

const base='https://runenwerk.example/api/';
function send(endpoint,opts={}){
 const {method='POST',body,contentType='application/json',origin}=opts;
 const headers={};
 if(contentType)headers['content-type']=contentType;
 if(origin)headers.origin=origin;
 return handler(new Request(base+endpoint,{method,headers,body:method==='GET'?undefined:body===undefined?'{}':body}));
}
async function expectResult(endpoint,opts,status){
 const response=await send(endpoint,opts);
 assert.equal(response.status,status);
 assert.match(response.headers.get('cache-control')||'',/no-store/);
 assert.match(response.headers.get('content-type')||'',/application\/json/);
 return response.json();
}
test('unknown endpoints do not leak internal data',async()=>{
 const result=await expectResult('secret-endpoint',{},404);
 assert.equal(result.error,'Endpunkt unbekannt');
});
test('invalid methods are refused before database access',async()=>{
 await expectResult('check-code',{method:'GET'},405);
 await expectResult('state',{method:'POST'},405);
});
test('cross-origin POST requests are denied',async()=>{
 await expectResult('check-code',{origin:'https://attacker.example'},403);
});
test('non-JSON, invalid JSON and oversized bodies are rejected',async()=>{
 await expectResult('check-code',{contentType:'text/plain',body:'{}'},415);
 await expectResult('check-code',{body:'{invalid'},400);
 await expectResult('check-code',{body:'[]'},400);
 await expectResult('check-code',{body:'{"payload":"'+('x'.repeat(4100))+'"}'},413);
});
test('SQL-like codes and invalid requests are refused',async()=>{
 await expectResult('check-code',{body:JSON.stringify({code:"ABC' OR 1=1 --"})},400);
 await expectResult('check-password',{body:JSON.stringify({code:'wrong',password:'password123'})},400);
 await expectResult('state?code=abc%27or%201%3D1',{method:'GET'},400);
});
test('failed auth is reported without exposing configuration',async()=>{
 const res=await send('create',{body:JSON.stringify({title:'test'})});
 assert.equal(res.status,403);
 const data=await res.json();
 assert.ok(!JSON.stringify(data).includes('SUPABASE_SERVICE_ROLE_KEY'));
});
