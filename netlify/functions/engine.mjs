export const PUZZLES = [
 {id:'runes',name:'Das Runensiegel',kind:'Kooperation',icon:'ᚱ',desc:'Ein Spieler berührt die Runen, der andere entziffert die Inschrift.'},
 {id:'levers',name:'Die sechs Hebel',kind:'Reihenfolge',icon:'⚙',desc:'Sechs Farben, sechs Klänge und eine verborgene Reihenfolge.'},
 {id:'compass',name:'Das Vermächtnis des Königs',kind:'Logik',icon:'✥',desc:'Sechs Richtungen führen zum Schatz des Königs.'},
 {id:'mirrors',name:'Die Spiegelkammer',kind:'Kooperation',icon:'◈',desc:'Zwei verschiedene Bilder. Vier Unterschiede ergeben den Türcode.'},
 {id:'pressure',name:'Die drei Druckplatten',kind:'Kooperation',icon:'⬡',desc:'Nur wenn drei Spieler gleichzeitig ihre Platte halten, öffnet sich das Tor.'},
 {id:'numbers',name:'Die verborgenen Zahlen',kind:'Beobachtung',icon:'⌗',desc:'Erkennt die Gegenstände und entschlüsselt den Zahlencode.'},
 {id:'chambers',name:'Die Feuerschale',kind:'Experiment',icon:'♨',desc:'Drei Schalter und nur eine Möglichkeit, die zweite Kammer zu betreten.'},
 {id:'einstein',name:'Die fünf Türme',kind:'Logik',icon:'♜',desc:'Fünf Türme und die Frage: Wer hält den Wasserdrachen?'}
];
export const defaultData=()=>({steps:[],solved:[],plates:{},switches:[false,false,false],fireStart:0,entered:false,attempts:0,events:[]});
const sequences={runes:['2','0','4','1'],levers:['4','0','1','5','3','2'],compass:['W','N','N','S','NW','E']};
function complete(data,puzzle){if(!data.solved.includes(puzzle))data.solved.push(puzzle);data.events.unshift({type:'success',message:`${PUZZLES.find(p=>p.id===puzzle)?.name||puzzle} gelöst`,at:Date.now()});}
export function applyAction(room,player,action){
 const d=structuredClone(room.data||defaultData());d.steps??=[];d.solved??=[];d.plates??={};d.switches??=[false,false,false];d.events??=[];
 const p=room.puzzle,host=player.role==='dm';let message='';let changed=true;
 if(action.type==='select' && host){if(!PUZZLES.some(x=>x.id===action.puzzle))throw Error('Rätsel unbekannt');room.puzzle=action.puzzle;room.phase='playing';d.steps=[];d.plates={};d.switches=[false,false,false];d.entered=false;d.fireStart=0;message='Rätsel gestartet';}
 else if(action.type==='phase' && host){if(!['lobby','playing','paused'].includes(action.phase))throw Error('Ungültige Phase');room.phase=action.phase;message='Sitzung aktualisiert';}
 else if(action.type==='reset' && host){d.steps=[];d.plates={};d.switches=[false,false,false];d.entered=false;d.fireStart=0;d.solved=d.solved.filter(x=>x!==p);message='Rätsel zurückgesetzt';}
 else if(action.type==='theme' && host){if(!['ember','forest','crypt'].includes(action.theme))throw Error('Ungültiges Theme');room.theme=action.theme;message='Design geändert';}
 else if(action.type==='solve' && host){complete(d,p);message='Rätsel freigegeben';}
 else {
 if(room.phase!=='playing')throw Error('Das Rätsel ist noch nicht gestartet.');
 if(d.solved.includes(p))throw Error('Dieses Rätsel wurde bereits gelöst.');
 if(action.type==='step' && ['runes','levers','compass'].includes(p)){
   if(p==='runes' && player.role==='b')throw Error('Nur die Runenwächter dürfen die Runen berühren.');
   const val=String(action.value);const seq=sequences[p];if(!seq.includes(val))throw Error('Ungültiges Symbol');
   if((p==='runes'||p==='levers') && d.steps.includes(val))throw Error('Bereits aktiviert');
   const next=[...d.steps,val];if(next.length>seq.length)throw Error('Sequenz ist voll');d.steps=next;
   if(next.length===seq.length){if(seq.every((v,i)=>v===next[i])){complete(d,p);message='Das Siegel öffnet sich!';}else{d.steps=[];d.attempts=(d.attempts||0)+1;message='Falsche Reihenfolge – zurückgesetzt';}}
 } else if(action.type==='code' && ['mirrors','numbers'].includes(p)){
   const code=String(action.value).trim().toUpperCase().replace(/\s/g,'');
   if(code.length>20)throw Error('Code zu lang');
   const expected={mirrors:'3142',numbers:'6342'};
   if(code===expected[p]){complete(d,p);message='Richtig! Das Tor öffnet sich.';}else{d.attempts=(d.attempts||0)+1;message='Der Code stimmt nicht.';}
 } else if(action.type==='plate' && p==='pressure'){
   if(!['a','b','c'].includes(player.role))throw Error('DM kann keine Druckplatte betreten');
   d.plates[player.id]=Boolean(action.value);message=action.value?'Druckplatte aktiviert':'Druckplatte verlassen';
   const roles=new Set(Object.entries(d.plates).filter(([,v])=>v).map(([id])=>(room.players||[]).find(x=>x.id===id)?.role).filter(Boolean));
   if(roles.size===3){complete(d,p);message='Alle Platten gedrückt!';}
 } else if(action.type==='toggle' && p==='chambers'){
   if(d.entered)throw Error('Die erste Kammer ist versiegelt.');
   const i=Number(action.value);if(!Number.isInteger(i)||i<0||i>2)throw Error('Ungültiger Schalter');
   d.switches[i]=!d.switches[i];if(i===0&&d.switches[i])d.fireStart=Date.now();message='Schalter verändert';
 } else if(action.type==='enter' && p==='chambers'){
   if(d.entered)throw Error('Die Kammer kann nur einmal betreten werden');
   d.entered=true;d.fireState=d.switches[1]?'lit':d.switches[0]?'warm':'cold';message='Die zweite Kammer ist nun zugänglich';
 } else if(action.type==='guess' && p==='chambers'){
   if(!d.entered)throw Error('Betritt zuerst die Kammer');
   if(Number(action.value)=== (d.fireState==='lit'?1:d.fireState==='warm'?0:2)){complete(d,p);message='Das Feuergeheimnis wurde gelüftet!';}
   else{d.attempts=(d.attempts||0)+1;message='Das falsche Symbol gewählt';}
 } else throw Error('Diese Aktion ist nicht möglich');
 }
 if(message){d.events.unshift({type:'info',message:message.slice(0,120),at:Date.now()});d.events=d.events.slice(0,12)}
 return {...room,data:d};
}
