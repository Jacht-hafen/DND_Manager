import {randomBytes,createHash,timingSafeEqual,scryptSync} from 'node:crypto';
import {applyAction,defaultData} from './engine.mjs';
import {validRoomCode,validDisplayName,rateLimit,safeError} from './security.mjs';
const json=(status,data)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const hash=s=>createHash('sha256').update(s).digest('hex');
const passwordHash=p=>{const salt=randomBytes(16).toString('hex');return salt+':'+scryptSync(p,salt,64).toString('hex')};
const checkPassword=(p,stored)=>{if(typeof p!=='string'||!stored||!stored.includes(':'))return false;const [salt,digest]=stored.split(':');if(!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{128}$/.test(digest))return false;return timingSafeEqual(scryptSync(p,salt,64),Buffer.from(digest,'hex'))};
const token=()=>randomBytes(32).toString('base64url');
const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code=()=>Array.from(randomBytes(6),x=>alphabet[x%alphabet.length]).join('');
function equal(a,b){if(!a||!b)return false;const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)}
async function db(path,{method='GET',body,prefer}={}){
 const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!base||!key)throw Error('Server-Konfiguration fehlt: Supabase-Umgebungsvariablen setzen.');
 const r=await fetch(`${base.replace(/\/$/,'')}/rest/v1/${path}`,{method,headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',...(prefer?{Prefer:prefer}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const data=await r.text();if(!r.ok)throw Error(`Database error ${r.status}: ${data.slice(0,200)}`);return data?JSON.parse(data):[];
}
async function getRoom(code){const x=await db(`rw_rooms?code=eq.${encodeURIComponent(code)}&select=*`);const room=x[0];if(!room||new Date(room.expires_at)<new Date())throw Error('Sitzung nicht gefunden oder abgelaufen');return room;}
async function authenticate(room,secret){if(!secret||typeof secret!=='string'||secret.length>200)throw Error('Zugriff verweigert');const h=hash(secret);if(equal(h,room.owner_hash))return {id:'dm',name:'Dungeon Master',role:'dm'};const ps=await db(`rw_players?room_id=eq.${room.id}&token_hash=eq.${h}&select=id,name,role`);if(!ps.length)throw Error('Zugriff verweigert');return ps[0];}
const cleanRoom=(room,players,actor)=>({code:room.code,title:room.title,theme:room.theme,puzzle:room.puzzle,phase:room.phase,version:room.version,expiresAt:room.expires_at,players:players.map(x=>({id:x.id,name:x.name,role:x.role})),you:{id:actor.id,role:actor.role,name:actor.name},data:room.data});
const validCode=validRoomCode;
const validUuid=s=>typeof s==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i.test(s);
async function requireUser(jwt){
 if(typeof jwt!=='string'||jwt.length<20||jwt.length>6000)throw Error('Zugriff verweigert');
 const base=process.env.SUPABASE_URL;
 const key=process.env.SUPABASE_PUBLISHABLE_KEY||'sb_publishable_ql4BxoH-no03FyVc_g-sGg_O9zChjGS';
 const response=await fetch(base.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:key,Authorization:'Bearer '+jwt},cache:'no-store'});
 if(!response.ok)throw Error('Zugriff verweigert');
 const user=await response.json();
 if(!validUuid(user.id))throw Error('Zugriff verweigert');
 return user;
}
async function audit(eventType,ip,codeValue){try{await db('rw_security_events',{method:'POST',body:{event_type:eventType,ip_hash:hash(ip).slice(0,48),room_code:validCode(codeValue)?codeValue:null}})}catch(e){console.error('Audit failed:',String(e?.message||e).slice(0,80))}}
async function centralLimit(scope,max=10,window=900){
 const r=await db('rpc/rw_limit_attempt',{method:'POST',body:{p_scope:scope,p_max:max,p_window_seconds:window}});
 if(r!==true)throw Error('Zu viele Anfragen');
}

async function handle(req){
 const url=new URL(req.url);const endpoint=url.pathname.split('/').pop();const method=req.method;
 if(!(['create','check-code','check-password','join','state','action','resume','remove-player','custom-start','delete-account'].includes(endpoint)))return json(404,{error:'Endpunkt unbekannt'});
 if(!((method==='GET'&&endpoint==='state')||(method==='POST'&&endpoint!=='state')))return json(405,{error:'Methode nicht erlaubt'});
 const origin=req.headers.get('origin');if(origin&&origin!==url.origin&&!String(process.env.ALLOWED_ORIGINS||'').split(',').map(s=>s.trim()).includes(origin))return json(403,{error:'Unerlaubte Herkunft'});
 const ip=(req.headers.get('x-real-ip')||req.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim().slice(0,64);
 if(rateLimit('api:'+ip+':'+endpoint,endpoint==='check-password'?18:endpoint==='create'?12:90))return json(429,{error:'Zu viele Anfragen. Bitte später erneut versuchen.'});
 if(method==='OPTIONS')return json(200,{});
 let b={};if(method==='POST'){const contentType=req.headers.get('content-type')||'';if(!contentType.toLowerCase().includes('application/json'))return json(415,{error:'JSON erwartet'});const raw=await req.text();if(raw.length>4096)return json(413,{error:'Anfrage zu groß'});try{b=JSON.parse(raw||'{}');if(!b||typeof b!=='object'||Array.isArray(b))return json(400,{error:'Ungültige Anfrage'})}catch{return json(400,{error:'Ungültiges JSON'})}}
 if(endpoint==='create'&&method==='POST'){
  const accessToken=b.access_token;
  const authUser=await requireUser(accessToken);
  const profiles=await db('rw_profiles?user_id=eq.'+encodeURIComponent(authUser.id)+'&select=is_premium');
  if(profiles[0]?.is_premium!==true)return json(403,{error:'Nur Premium-Mitglieder dürfen Spiele erstellen.'});
  let campaign=null;
  if(b.campaign_id){if(!validUuid(b.campaign_id))return json(400,{error:'Ungültige Kampagne'});
   const campaigns=await db('rw_campaigns?id=eq.'+b.campaign_id+'&owner_id=eq.'+authUser.id+'&select=id');
   if(!campaigns.length)return json(403,{error:'Kampagne gehört nicht zu deinem Konto'});
   campaign=b.campaign_id;
  }
  const pass=b.password;if(typeof pass!=='string'||pass.length<8||pass.length>100)return json(400,{error:'Das Raum-Passwort muss 8 bis 100 Zeichen lang sein.'});
  const owner=token(),title=String(b.title||'Neue Kampagne').trim().slice(0,70)||'Neue Kampagne';
  for(let n=0;n<5;n++){try{const c=code();const created=await db('rw_rooms',{method:'POST',body:{code:c,owner_hash:hash(owner),owner_user_id:authUser.id,campaign_id:campaign,title,password_hash:passwordHash(pass),expires_at:new Date(Date.now()+365*86400000).toISOString(),data:defaultData()},prefer:'return=representation'});await db('rw_session_index',{method:'POST',body:{room_id:created[0].id,campaign_id:campaign,owner_id:authUser.id,code:c,title,puzzle:'runes',solved:[],expires_at:created[0].expires_at}});return json(201,{code:c,token:owner});}catch(e){if(!String(e).includes('23505'))throw e}}
  throw Error('Konnte keinen Sitzungscode erstellen');
 }
 if(endpoint==='resume'&&method==='POST'){
  const user=await requireUser(b.access_token);
  const c=String(b.code||'').toUpperCase();if(!validCode(c))return json(400,{error:'Ungültiger Code'});
  const rows=await db('rw_rooms?code=eq.'+c+'&owner_user_id=eq.'+user.id+'&select=id,code,expires_at');
  if(!rows.length||new Date(rows[0].expires_at)<new Date())return json(404,{error:'Sitzung nicht gefunden oder abgelaufen'});
  const owner=token();const expires_at=new Date(Date.now()+365*86400000).toISOString();await db('rw_rooms?id=eq.'+rows[0].id,{method:'PATCH',body:{owner_hash:hash(owner),expires_at}});await db('rw_session_index?room_id=eq.'+rows[0].id,{method:'PATCH',body:{expires_at}});
  return json(200,{code:c,token:owner});
 }
 if(endpoint==='remove-player'&&method==='POST'){
  const c=String(b.code||'').toUpperCase();if(!validCode(c))return json(400,{error:'Ungültiger Code'});
  const room=await getRoom(c);const actor=await authenticate(room,b.token);
  if(actor.role!=='dm')return json(403,{error:'Nur Dungeon Master dürfen Spieler entfernen'});
  const role=String(b.role||'');if(!/^[abc]$/.test(role))return json(400,{error:'Ungültige Rolle'});
  await db('rw_players?room_id=eq.'+room.id+'&role=eq.'+role,{method:'DELETE'});
  return json(200,{ok:true});
 }

 if(endpoint==='custom-start'&&method==='POST'){
  const c=String(b.code||'').toUpperCase();if(!validCode(c)||!validUuid(b.puzzle_id))return json(400,{error:'Ungültiges Rätsel'});
  const room=await getRoom(c);const actor=await authenticate(room,b.token);
  if(actor.role!=='dm'||!room.owner_user_id)return json(403,{error:'Nur der Dungeon Master kann Rätsel starten'});
  const puzzles=await db('rw_custom_puzzles?id=eq.'+b.puzzle_id+'&owner_id=eq.'+room.owner_user_id+'&select=id,title,description');
  if(!puzzles.length)return json(404,{error:'Rätsel nicht gefunden'});
  const data={...defaultData(),custom:{id:puzzles[0].id,title:puzzles[0].title,description:puzzles[0].description}};
  const saved=await db('rw_rooms?id=eq.'+room.id+'&version=eq.'+room.version,{method:'PATCH',body:{puzzle:'custom',phase:'playing',data,version:room.version+1},prefer:'return=representation'});
  if(!saved.length)return json(409,{error:'Sitzung wurde gleichzeitig geändert'});
  await db('rw_session_index?room_id=eq.'+room.id,{method:'PATCH',body:{phase:'playing',puzzle:'custom',solved:[],last_activity:new Date().toISOString()}});
  const players=await db('rw_players?room_id=eq.'+room.id+'&select=id,name,role');
  return json(200,cleanRoom(saved[0],players,actor));
 }
 if(endpoint==='delete-account'&&method==='POST'){
  const user=await requireUser(b.access_token);
  if(b.confirm!=='KONTO LÖSCHEN')return json(400,{error:'Bestätigung fehlt'});
  await centralLimit('account-delete:'+user.id,3,3600);
  const base=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const response=await fetch(base.replace(/\/$/,'')+'/auth/v1/admin/users/'+user.id,{method:'DELETE',headers:{apikey:key,Authorization:'Bearer '+key}});
  if(!response.ok)throw Error('Database error: Account konnte nicht gelöscht werden');
  return json(200,{ok:true});
 }
 if(endpoint==='check-code'&&method==='POST'){
  const c=String(b.code||'').trim().toUpperCase();if(!validCode(c))return json(400,{error:'Bitte einen gültigen sechsstelligen Code eingeben.'});
  await centralLimit('code:'+ip,120,900);
  try{const room=await getRoom(c);if(!room.password_hash)return json(409,{error:'Dieser ältere Raum besitzt noch kein Passwort. Bitte einen neuen Raum erstellen.'});return json(200,{exists:true,title:room.title})}catch{return json(404,{error:'Kein aktives Spiel mit diesem Code gefunden.'})}
 }
 if(endpoint==='check-password'&&method==='POST'){
  const c=String(b.code||'').trim().toUpperCase();if(!validCode(c))return json(400,{error:'Ungültiger Sitzungscode'});
  if(rateLimit('room-pass:'+c,50))return json(429,{error:'Zu viele Passwortversuche. Bitte später erneut versuchen.'});
  await centralLimit('password:'+c+':'+ip,12,900);
  await centralLimit('password-room:'+c,90,900);
  const room=await getRoom(c);if(!checkPassword(b.password,room.password_hash)){await audit('wrong_password',ip,c);return json(403,{error:'Falsches Raum-Passwort'})}
  return json(200,{valid:true,title:room.title});
 }
 if(endpoint==='join'&&method==='POST'){
  const c=String(b.code||'').toUpperCase();if(!validCode(c))return json(400,{error:'Ungültiger Sitzungscode'});
  if(rateLimit('room-join:'+c,65))return json(429,{error:'Zu viele Beitrittsversuche. Bitte später erneut versuchen.'});
  await centralLimit('join:'+c+':'+ip,20,900);
  const room=await getRoom(c);if(!checkPassword(b.password,room.password_hash))return json(403,{error:'Falsches Raum-Passwort'});const name=String(b.name||'').trim().slice(0,32),role=String(b.role||'');
  if(!validDisplayName(name)||!/^[abc]$/.test(role))return json(400,{error:'Name (min. 2 Zeichen) und Rolle A/B/C wählen'});
  const players=await db(`rw_players?room_id=eq.${room.id}&select=id,role,name`);
  if(players.some(p=>p.role===role))return json(409,{error:`Rolle ${role.toUpperCase()} ist bereits vergeben`});
  const secret=token();await db('rw_players',{method:'POST',body:{room_id:room.id,token_hash:hash(secret),name,role},prefer:'return=representation'});
  return json(201,{code:c,token:secret});
 }
 const c=String(method==='GET'?url.searchParams.get('code'):b.code||'').toUpperCase();if(!validCode(c))return json(400,{error:'Ungültiger Sitzungscode'});
 const room=await getRoom(c),secret=method==='GET'?req.headers.get('x-room-token'):b.token,actor=await authenticate(room,secret);
 if(endpoint==='state'&&method==='GET'){
  const players=await db(`rw_players?room_id=eq.${room.id}&select=id,name,role`);
  return json(200,cleanRoom(room,players,actor));
 }
 if(endpoint==='action'&&method==='POST'){
  if(!b.action||typeof b.action!=='object'||Array.isArray(b.action)||typeof b.action.type!=='string'||b.action.type.length>20)return json(400,{error:'Aktion fehlt'});
  const players=await db(`rw_players?room_id=eq.${room.id}&select=id,name,role`);
  for(let i=0;i<7;i++){
   const current=i===0?room:await getRoom(c);
   const next=applyAction({...current,players},actor,b.action);
   const update={data:next.data,puzzle:next.puzzle,phase:next.phase,theme:next.theme,version:current.version+1};
   const saved=await db(`rw_rooms?id=eq.${current.id}&version=eq.${current.version}`,{method:'PATCH',body:update,prefer:'return=representation'});
   if(saved.length){await db('rw_session_index?room_id=eq.'+room.id,{method:'PATCH',body:{phase:saved[0].phase,puzzle:saved[0].puzzle,solved:saved[0].data.solved||[],last_activity:new Date().toISOString()}});return json(200,cleanRoom(saved[0],players,actor))}
  }
  return json(409,{error:'Viele gleichzeitige Eingaben – bitte erneut versuchen'});
 }
 return json(404,{error:'Endpunkt unbekannt'});
}
export default async(req)=>{try{return await handle(req)}catch(e){console.error('Runenwerk API:',String(e?.message||e).slice(0,250));const response=safeError(e);return json(response.status,{error:response.error})}};
export const config={path:'/api/:endpoint'};
