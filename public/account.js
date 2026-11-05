import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';
const db = createClient('https://zxzrtwfzouhbfdzextxo.supabase.co', 'sb_publishable_ql4BxoH-no03FyVc_g-sGg_O9zChjGS'), $ = id => document.getElementById(id);
const msg = s => $('msg').textContent = s;
let accountRefreshing=false;
let registerBusy=false;

async function refresh() {
  if(accountRefreshing)return;
  accountRefreshing=true;
  try {
  const {
    data: {
      user
    }
  } = await db.auth.getUser();

  $('auth').hidden = !!user;
  $('dashboard').hidden = !user;

  if (!user)
    return;

  const {
    data: p
  } = await db.from('rw_profiles').select('display_name,is_premium').eq('user_id', user.id).single();

  $('hello').textContent = 'Willkommen ' + (p?.display_name || user.email);
  $('plan').textContent = p?.is_premium ? 'Premium – Gruppen erstellen freigeschaltet' : 'Free – Gruppen beitreten möglich';
  $('createBtn').disabled = !p?.is_premium;

  const {
    data: m
  } = await db.from('rw_memberships').select('group_id').eq('user_id', user.id);

  let ids = (m || []).map(x => x.group_id);
  $('groups').replaceChildren();

  if (!ids.length) {
    $('groups').textContent = 'Noch keine Gruppen';
    return;
  }

  const [{data:gs,error:groupsError},{data:members,error:membersError}] = await Promise.all([
    db.from('rw_groups').select('id,name,invite_code').in('id',ids),
    db.rpc('rw_group_member_overview')
  ]);
  if(groupsError)throw groupsError;
  if(membersError)throw membersError;
  for (const g of gs || []) {
    const section=document.createElement('section');
    section.className='group-entry';
    const title=document.createElement('h3');
    title.textContent=g.name;
    const invite=document.createElement('p');
    invite.textContent='Einladungscode: '+g.invite_code;
    const groupMembers=(members||[]).filter(m=>m.group_id===g.id);
    const subtitle=document.createElement('p');
    subtitle.textContent='Mitglieder ('+groupMembers.length+')';
    const list=document.createElement('ul');
    for(const m of groupMembers){
      const item=document.createElement('li');
      item.textContent=m.display_name+(m.is_owner?' (Gruppenleiter)':'');
      list.append(item);
    }
    section.append(title,invite,subtitle,list);
    $('groups').append(section);
  }
  } catch(error){console.error('Account update:',error);msg('Gruppendaten konnten nicht aktualisiert werden.');}
  finally{accountRefreshing=false;}
}

$('login').onsubmit = async e => {
  e.preventDefault();
  const f = new FormData(e.target);

  const {
    error
  } = await db.auth.signInWithPassword({
    email: f.get('email'),
    password: f.get('password')
  });

  msg(error?.message || 'Angemeldet');
  await refresh();
};

$('register').onsubmit = async e => {
  e.preventDefault();
  if(registerBusy)return;
  registerBusy=true;
  const button=e.target.querySelector('button[type="submit"]');
  if(button)button.disabled=true;
  const f=new FormData(e.target);
  try {
    const {data,error}=await db.auth.signUp({
      email:String(f.get('email')||'').trim(),
      password:String(f.get('password')||''),
      options:{
        data:{display_name:String(f.get('name')||'').trim()},
        emailRedirectTo:location.origin+'/account.html'
      }
    });
    if(error){
      const {data:{user}}=await db.auth.getUser();
      msg(user?'Dein Konto ist bereits angemeldet.':error.message);
      if(user)await refresh();
      return;
    }
    msg(data.session?'Konto erfolgreich erstellt und angemeldet.':'Registrierung angenommen. Bitte prüfe deine E-Mail zur Bestätigung. Falls du bereits registriert bist, melde dich an.');
    if(data.session)await refresh();
  } catch(error) {
    msg('Registrierung konnte nicht abgeschlossen werden. Bitte prüfe, ob dein Konto bereits existiert, und versuche gegebenenfalls die Anmeldung.');
    console.error('Registration error:',error);
  } finally {
    registerBusy=false;
    if(button)button.disabled=false;
  }
};

$('logout').onclick = async () => {
  await db.auth.signOut();
  await refresh();
};

$('create').onsubmit = async e => {
  e.preventDefault();

  const f = new FormData(e.target),
        {
          data: {
            user
          }
        } = await db.auth.getUser();

  const {
    error
  } = await db.from('rw_groups').insert({
    owner_id: user.id,
    name: String(f.get('name')).trim()
  });

  msg(error?.message || 'Gruppe erstellt');
  await refresh();
};

$('join').onsubmit = async e => {
  e.preventDefault();

  const {
    error
  } = await db.rpc('rw_join_group', {
    p_code: String(new FormData(e.target).get('code')).trim().toUpperCase()
  });

  msg(error?.message || 'Beigetreten');
  await refresh();
};

$('password-reset').onsubmit=async e=>{
 e.preventDefault();const email=String(new FormData(e.target).get('email')||'').trim();
 const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:location.origin+'/account.html'});
 msg(error?.message||'Falls das Konto existiert, erhältst du eine E-Mail mit dem Reset-Link.');
};
$('password-update').onsubmit=async e=>{
 e.preventDefault();const password=String(new FormData(e.target).get('password')||'');
 if(password.length<12){msg('Bitte mindestens 12 Zeichen verwenden.');return}
 const {error}=await db.auth.updateUser({password});msg(error?.message||'Passwort geändert');
 if(!error)$('password-recovery').hidden=true;
};
$('export-data').onclick=async()=>{
 try{
 const {data:{user}}=await db.auth.getUser();if(!user)throw Error('Nicht angemeldet');
 const tables=['rw_profiles','rw_groups','rw_memberships','rw_campaigns','rw_session_index','rw_custom_puzzles','rw_favorites','rw_reviews','rw_handouts'];
 const result={exported_at:new Date().toISOString()};
 for(const name of tables){const {data,error}=await db.from(name).select('*');if(error)throw error;result[name]=data}
 const url=URL.createObjectURL(new Blob([JSON.stringify(result,null,2)],{type:'application/json'}));
 const a=document.createElement('a');a.href=url;a.download='runenwerk-daten.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);msg('Datenexport erstellt');
 }catch(error){msg(error.message)}
};
$('delete-account').onclick=async()=>{
 const confirmation=prompt('Zum unwiderruflichen Löschen KONTO LÖSCHEN eingeben:');
 if(confirmation!=='KONTO LÖSCHEN')return;
 if(!confirm('Konto und zugehörige Daten endgültig löschen?'))return;
 try{const {data:{session}}=await db.auth.getSession();if(!session)throw Error('Bitte erneut anmelden');
 const res=await fetch('/api/delete-account',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({access_token:session.access_token,confirm:confirmation})});
 const result=await res.json();if(!res.ok)throw Error(result.error||'Löschen fehlgeschlagen');
 await db.auth.signOut();location.href='/';}catch(error){msg(error.message)}
};
db.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY')$('password-recovery').hidden=false;setTimeout(refresh,0)});
refresh();

// Update member lists in open group pages without a manual reload.
setInterval(()=>{if(document.visibilityState==='visible'&&!$('dashboard').hidden)refresh()},5000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
