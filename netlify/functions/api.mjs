import {randomBytes,createHash,timingSafeEqual,scryptSync} from 'node:crypto';
import {applyAction,defaultData} from './engine.mjs';
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
const validCode=s=>typeof s==='string'&&/^[A-Z2-9]{6}$/.test(s);
async function handle(req){
 const url=new URL(req.url);const endpoint=url.pathname.split('/').pop();const method=req.method;
 if(method==='OPTIONS')return json(200,{});
 let b={};if(method==='POST'){const raw=await req.text();if(raw.length>4096)return json(413,{error:'Anfrage zu groß'});try{b=JSON.parse(raw||'{}')}catch{return json(400,{error:'Ungültiges JSON'})}}
 if(endpoint==='create'&&method==='POST'){
  const accessToken=b.access_token;
  if(typeof accessToken!=='string'||accessToken.length<20)return json(401,{error:'Bitte anmelden, um eine Spielsitzung zu erstellen.'});
  const base=process.env.SUPABASE_URL;
  const publishable='sb_publishable_ql4BxoH-no03FyVc_g-sGg_O9zChjGS';
  if(!base)throw Error('Supabase-Konfiguration fehlt');
  const authResponse=await fetch(base.replace(/\/$/,'')+'/auth/v1/user',{headers:{apikey:publishable,Authorization:'Bearer '+accessToken}});
  if(!authResponse.ok)return json(401,{error:'Anmeldung ungültig oder abgelaufen'});
  const authUser=await authResponse.json();
  const profiles=await db('rw_profiles?user_id=eq.'+encodeURIComponent(authUser.id)+'&select=is_premium');
  if(profiles[0]?.is_premium!==true)return json(403,{error:'Nur Premium-Mitglieder dürfen Spiele erstellen.'});
  const pass=String(b.password||'');if(pass.length<8||pass.length>100)return json(400,{error:'Das Raum-Passwort muss 8 bis 100 Zeichen lang sein.'});
  const owner=token(),title=String(b.title||'Neue Kampagne').trim().slice(0,70)||'Neue Kampagne';
  for(let n=0;n<5;n++){try{const c=code();await db('rw_rooms',{method:'POST',body:{code:c,owner_hash:hash(owner),title,password_hash:passwordHash(pass),data:defaultData()},prefer:'return=representation'});return json(201,{code:c,token:owner});}catch(e){if(!String(e).includes('23505'))throw e}}
  throw Error('Konnte keinen Sitzungscode erstellen');
 }
 if(endpoint==='check-code'&&method==='POST'){
  const c=String(b.code||'').trim().toUpperCase();if(!validCode(c))return json(400,{error:'Bitte einen gültigen sechsstelligen Code eingeben.'});
  try{const room=await getRoom(c);if(!room.password_hash)return json(409,{error:'Dieser ältere Raum besitzt noch kein Passwort. Bitte einen neuen Raum erstellen.'});return json(200,{exists:true,title:room.title})}catch{return json(404,{error:'Kein aktives Spiel mit diesem Code gefunden.'})}
 }
 if(endpoint==='check-password'&&method==='POST'){
  const c=String(b.code||'').trim().toUpperCase();if(!validCode(c))return json(400,{error:'Ungültiger Sitzungscode'});
  const room=await getRoom(c);if(!checkPassword(b.password,room.password_hash))return json(403,{error:'Falsches Raum-Passwort'});
  return json(200,{valid:true,title:room.title});
 }
 if(endpoint==='join'&&method==='POST'){
  const c=String(b.code||'').toUpperCase();if(!validCode(c))return json(400,{error:'Ungültiger Sitzungscode'});
  const room=await getRoom(c);if(!checkPassword(b.password,room.password_hash))return json(403,{error:'Falsches Raum-Passwort'});const name=String(b.name||'').trim().slice(0,32),role=String(b.role||'');
  if(name.length<2||!/^[abc]$/.test(role))return json(400,{error:'Name (min. 2 Zeichen) und Rolle A/B/C wählen'});
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
  if(!b.action||typeof b.action!=='object')return json(400,{error:'Aktion fehlt'});
  const players=await db(`rw_players?room_id=eq.${room.id}&select=id,name,role`);
  for(let i=0;i<7;i++){
   const current=i===0?room:await getRoom(c);
   const next=applyAction({...current,players},actor,b.action);
   const update={data:next.data,puzzle:next.puzzle,phase:next.phase,theme:next.theme,version:current.version+1};
   const saved=await db(`rw_rooms?id=eq.${current.id}&version=eq.${current.version}`,{method:'PATCH',body:update,prefer:'return=representation'});
   if(saved.length)return json(200,cleanRoom(saved[0],players,actor));
  }
  return json(409,{error:'Viele gleichzeitige Eingaben – bitte erneut versuchen'});
 }
 return json(404,{error:'Endpunkt unbekannt'});
}
export default async(req)=>{try{return await handle(req)}catch(e){const msg=String(e?.message||e);const publicMessage=msg.includes('23505')?'Diese Rolle wurde gerade von einer anderen Person belegt.':msg.startsWith('Database error')?'Datenbankfehler. Bitte Konfiguration und SQL-Schema prüfen.':msg;return json(/nicht gefunden|abgelaufen/i.test(msg)?404:/Zugriff verweigert/i.test(msg)?403:400,{error:publicMessage})}};
export const config={path:'/api/:endpoint'};
