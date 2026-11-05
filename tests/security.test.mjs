import test from 'node:test';
import assert from 'node:assert/strict';
import {validRoomCode,validDisplayName,rateLimit,safeError} from '../netlify/functions/security.mjs';
test('room codes reject special characters and SQL fragments',()=>{
  assert.equal(validRoomCode('ABC234'),true);
  for(const value of ["ABC' OR 1=1",'A.B234','ABC 23','ABC2--',null,{},''])assert.equal(validRoomCode(value),false);
});
test('player names have limits and reject control characters',()=>{
 assert.equal(validDisplayName('Arannis'),true);
 assert.equal(validDisplayName('A'),false);
 assert.equal(validDisplayName('a'.repeat(33)),false);
 assert.equal(validDisplayName('hello\\nworld'),true); // literal backslash is not a control character
 assert.equal(validDisplayName('hello\nworld'),false);
});
test('rate limiting caps attempts within window and resets afterward',()=>{
 const k='unit-test-'+Date.now();assert.equal(rateLimit(k,2,1000,0),false);assert.equal(rateLimit(k,2,1000,1),false);assert.equal(rateLimit(k,2,1000,2),true);assert.equal(rateLimit(k,2,1000,1000),false);
});
test('internal errors are never returned to API consumers',()=>{
 const result=safeError(new Error('Database error 500: secret TOKEN'));
 assert.equal(result.status,503);
 assert.equal(JSON.stringify(result).includes('secret'),false);
});
