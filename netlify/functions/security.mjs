const recent=new Map();
export const validRoomCode=value=>typeof value==='string' && /^[A-Z2-9]{6}$/.test(value);
export const validDisplayName=value=>typeof value==='string' && value.trim().length>=2 && value.trim().length<=32 && !/[\u0000-\u001f\u007f]/.test(value);
export function rateLimit(key,limit=20,windowMs=900000,now=Date.now()){
  if(recent.size>5000){for(const [k,v] of recent){if(now-v.start>windowMs)recent.delete(k)}if(recent.size>5000)recent.clear()}
  const item=recent.get(key);
  if(!item || now-item.start>=windowMs){recent.set(key,{count:1,start:now});return false}
  item.count++;
  return item.count>limit;
}
export const safeError=error=>{
  const message=String(error?.message||error||'');
  if(message.includes('23505'))return {status:409,error:'Diese Rolle ist bereits vergeben.'};
  if(message.startsWith('Database error')||message.includes('Server-Konfiguration'))return {status:503,error:'Dienst vorübergehend nicht verfügbar.'};
  if(/Zugriff verweigert/i.test(message))return {status:403,error:'Zugriff verweigert.'};
  if(/nicht gefunden|abgelaufen/i.test(message))return {status:404,error:'Sitzung nicht gefunden oder abgelaufen.'};
  return {status:400,error:'Ungültige Anfrage.'};
};
