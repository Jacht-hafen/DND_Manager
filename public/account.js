import{createClient}from'https://esm.sh/@supabase/supabase-js@2.49.4';
const db=createClient('https://pdupzfggfdwvbmosopuz.supabase.co','sb_publishable_eO-c5CBF7DsUi3bFrel6rw_D7ZId_XV'),$=id=>document.getElementById(id);
const msg=(s)=>$('msg').textContent=s;
async function refresh(){const{data:{user}}=await db.auth.getUser();$('auth').hidden=!!user;$('dashboard').hidden=!user;if(!user)return;
const{data:p}=await db.from('rw_profiles').select('display_name,is_premium').eq('user_id',user.id).single();$('hello').textContent='Willkommen '+(p?.display_name||user.email);$('plan').textContent=p?.is_premium?'Premium – Gruppen erstellen freigeschaltet':'Free – Gruppen beitreten möglich';$('createBtn').disabled=!p?.is_premium;
const{data:m}=await db.from('rw_memberships').select('group_id').eq('user_id',user.id);let ids=(m||[]).map(x=>x.group_id);$('groups').replaceChildren();if(!ids.length){$('groups').textContent='Noch keine Gruppen';return}
const{data:gs}=await db.from('rw_groups').select('name,invite_code').in('id',ids);for(const g of gs||[]){const p=document.createElement('p');p.textContent=g.name+' – Einladungscode: '+g.invite_code;$('groups').append(p)}}
$('login').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const{error}=await db.auth.signInWithPassword({email:f.get('email'),password:f.get('password')});msg(error?.message||'Angemeldet');await refresh()};
$('register').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const{data,error}=await db.auth.signUp({email:f.get('email'),password:f.get('password'),options:{data:{display_name:f.get('name')},emailRedirectTo:location.origin+'/account.html'}});msg(error?.message||(data.session?'Registriert':'Bitte bestätige deine E-Mail'));await refresh()};
$('logout').onclick=async()=>{await db.auth.signOut();await refresh()};
$('create').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),{data:{user}}=await db.auth.getUser();const{error}=await db.from('rw_groups').insert({owner_id:user.id,name:String(f.get('name')).trim()});msg(error?.message||'Gruppe erstellt');await refresh()};
$('join').onsubmit=async e=>{e.preventDefault();const{error}=await db.rpc('rw_join_group',{p_code:String(new FormData(e.target).get('code')).trim().toUpperCase()});msg(error?.message||'Beigetreten');await refresh()};
db.auth.onAuthStateChange(()=>setTimeout(refresh,0));refresh();