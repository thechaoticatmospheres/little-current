import {VERSION, OFFLINE_CAP, PHASES, PLANTS, ANIMALS, FOOTPRINTS, EQUIPMENT, GLOBALS, CULTURES, CONTRACTS, RECIPES, SPACE, POWER, emptyMap} from './content.mjs';
const clone = s => structuredClone(s);
const cap = (x,a,b) => Math.max(a,Math.min(b,x));
const demand = (condition,message) => { if (!condition) throw new Error(message); };
const stock = (s,key) => s.inventory.plants[key] || 0;
const money = n => '$'+(n/100).toFixed(2);
export function tank(id,footprint='starter',name='The windowsill') {
  return {id,name,footprint,ready:45,crop:'hornwort',biomass:8000,growthCarry:0,reserve:4000,settle:0,
    species:null,breeders:0,young:[0,0,0],cohorts:[],pulse:0,yieldCarry:0,companions:[],
    equipment:emptyMap(EQUIPMENT),water:{a:0,i:0,n:12},traits:{appearance:0,yield:0},selection:null,
    policy:{trim:false,plants:'hold',fish:'hold',food:'balanced',nursery:null}};
}
export function initialState() {
  return {version:VERSION,time:0,remainder:0,cash:600,phase:1,paused:false,nextId:2,
    tanks:[tank('t1')],cultures:[],jobs:[],unlocks:emptyMap(GLOBALS),
    inventory:{plants:emptyMap(PLANTS),food:emptyMap(CULTURES),media:0,frames:0,nutrients:10,feed:5},
    stats:{earned:0,fishSold:0,plantsSold:0,bred:{},cropsSold:{},contracts:0,setups:0,recipes:{},cultureProduced:0,strains:0},
    repeat:[],autoMedia:false,mediaProgress:0,repairProgress:0,
    finale:{active:false,delivered:[],supply:0,progress:0,completedAt:null},
    settings:{motion:true,sound:false,textSize:1},goal:null,
    history:[{at:0,text:'A neighbor brought mature filter media. The scratched glass is yours to fill.'}]};
}
function log(s,text) { s.history.push({at:s.time,text}); if(s.history.length>70)s.history.shift(); }
export const tankById = (s,id) => s.tanks.find(t=>t.id===id);
function requiredTank(s,id) { const t=tankById(s,id); demand(t,'That aquarium is no longer available.'); return t; }
export function held(s,id) { return s.jobs.reduce((sum,j)=>sum+(j.escrow?.fish||[]).filter(f=>f.tank===id).reduce((a,f)=>a+f.count,0),0); }
export function tankView(s,t) {
  const fp=FOOTPRINTS[t.footprint], animal=ANIMALS[t.species], p=PLANTS[t.crop], e=t.equipment;
  const young=t.young.reduce((a,b)=>a+b,0), fry=t.cohorts.reduce((a,c)=>a+c.count,0), promised=held(s,t.id);
  const count=t.breeders+young+fry+promised;
  const load=count*(animal?.load||1)+t.companions.length;
  const filter=[4,16,36,76][e.sponge];
  const capacity=Math.min(fp.capacity,filter*(e.sensor?1.1:1));
  const plantCap=(fp.plants+e.substrate*6)*1000;
  const growthFactor=(1+.3*e.light+.1*e.substrate)*(t.companions.includes('amano')?1.1:1)*(t.crop==='vallisneria'&&fp.tags.includes('long')?1.25:1)*(t.crop==='rotala'&&!e.light? .35:1);
  const potential=t.biomass/1000*p.rate*growthFactor;
  const power=2+e.light+e.exchange+(e.feeder?1:0);
  const missing=habitat(t,t.species);
  let blocker=t.ready>0?'Fishless commissioning in progress':!animal?'Ready for a breeding group':missing||'';
  if(!blocker && !t.breeders)blocker='Grow-out tank: receiving cohorts';
  if(!blocker && load+animal.load>capacity+.0001)blocker='Nursery full · new births wait safely';
  if(!blocker && t.water.n>50)blocker='Nutrient export limits breeding · trim or improve exchange';
  if(!blocker && t.breeders)blocker='Stable · breeding and growth continue';
  return {count,young,fry,promised,load,capacity,plantCap,potential,power,blocker,
    nextMature:t.cohorts.length?Math.min(...t.cohorts.map(c=>c.remaining)):null,
    pulseEvery:animal&&!animal.utility?animal.pulse/(1+.1*e.feeder):0};
}
function habitat(t,species) {
  if(!species)return '';
  const a=ANIMALS[species], fp=FOOTPRINTS[t.footprint];
  if(a.need==='nursery'&&!t.equipment.nursery)return 'Needs a mesh nursery or partition';
  if(a.need==='cave'&&!t.equipment.cave)return 'Needs a spawning cave';
  if(a.need==='calm'&&!t.equipment.calm)return 'Needs a gentle-flow baffle';
  if(a.need==='long'&&!fp.tags.includes('long'))return 'Needs a long, rack or breeder footprint';
  if(a.need==='large'&&!fp.tags.includes('large'))return 'Needs a 40 breeder or 75 display';
  if(a.need==='plants'&&t.biomass<4000)return 'Needs at least 4 retained plant biomass';
  return '';
}
export function facility(s) { return {space:s.tanks.reduce((n,t)=>n+FOOTPRINTS[t.footprint].space,0)+s.cultures.length+(s.unlocks.workshop?2:0),spaceCap:SPACE(s),power:s.tanks.reduce((n,t)=>n+tankView(s,t).power,0)+s.cultures.length,powerCap:POWER(s)}; }
export function phaseNeeds(s) {
  const bred=Object.keys(s.stats.bred).length, crops=Object.keys(s.stats.cropsSold).length;
  const checklist=[
    [[s.stats.fishSold>=4,'Sell 4 home-grown juveniles'],[!!s.unlocks.dispatcher,'Install a surplus dispatcher'],[s.tanks.length>=2,'Commission a second aquarium']],
    [[bred>=2,'Raise cohorts of two species'],[s.stats.contracts>=2,'Complete two fish-store contracts'],[!!s.unlocks.rack,'Buy the spare shelf']],
    [[s.stats.cultureProduced>=4,'Produce 4 culture portions'],[crops>=2,'Sell two different plant crops'],[s.tanks.length>=3,'Install three aquariums'],[!!s.unlocks.workshop,'Open the setup workshop']],
    [[Object.keys(s.stats.recipes).length>=2,'Deliver two different setup designs'],[!!s.unlocks.controller,'Install the fish room controller']],
    [[s.stats.strains>=2,'Complete two directed selection projects'],[s.tanks.length>=4,'Install four aquariums'],[Object.keys(s.stats.recipes).length>=3,'Deliver three different setup designs']],
  ];
  if(s.phase<6)return checklist[s.phase-1];
  return [[s.finale.active,'Begin the Independent Fish Room project'],...[['guppy','Deliver a beginner guppy setup'],['planted','Deliver a low-tech planted nano'],['breeder','Deliver a specialty breeding package']].map(([id,label])=>[s.finale.delivered.includes(id),label]),[s.finale.supply>=3,`Complete 3 supply contracts during the project (${s.finale.supply}/3)`],[s.finale.progress>=1800,`Verify 30 productive minutes (${Math.floor(s.finale.progress/60)}/30)`]];
}
export function goal(s) {
  if(s.finale.completedAt!==null)return 'Your independent fish room is complete. Keep growing, or simply enjoy what you built.';
  if(s.phase===1&&!s.tanks.some(t=>t.breeders)){const t=s.tanks[0];if(!t.equipment.sponge)return 'Trim and sell cuttings, then install the $8 sponge filter.';return t.ready?'Let the fishless check finish, then introduce a guppy group.':'Save $12 and introduce your first guppy breeding group.';}
  return phaseNeeds(s).find(([done])=>!done)?.[1]||'The next chapter is ready.';
}
function progression(s,elapsed=0) {
  while(s.phase<6 && phaseNeeds(s).every(([done])=>done)) { s.phase++; log(s,`Chapter ${s.phase}: ${PHASES[s.phase-1][0]}. ${PHASES[s.phase-1][1]}`); }
  if(s.finale.active && s.finale.completedAt===null && ['guppy','planted','breeder'].every(k=>s.finale.delivered.includes(k)) && s.finale.supply>=3) {
    if(s.tanks.every(t=>!t.ready && tankView(s,t).load<=tankView(s,t).capacity+.01 && t.water.a<=2 && t.water.i<=2)) s.finale.progress+=elapsed;
    if(s.finale.progress>=1800){s.finale.completedAt=s.time;log(s,'The Independent Fish Room is complete. It started with a scratched tank. Look at it now.');}
  }
}
function credit(s,cents){s.cash+=Math.round(cents);s.stats.earned+=Math.round(cents);}
function charge(s,cents){demand(s.cash>=cents,`Needs ${money(cents)}; you have ${money(s.cash)}.`);s.cash-=cents;}
function phaseCheck(s,n){demand(s.phase>=n,`Available in chapter ${n}: ${PHASES[n-1][0]}.`);}
export function availableFish(s,id,minimumGrade=0){return s.tanks.filter(t=>t.species===id).reduce((n,t)=>n+t.young.slice(minimumGrade).reduce((a,b)=>a+b,0),0);}
export function templatePrice(t){let price=FOOTPRINTS[t.footprint].cost+PLANTS[t.crop].seed+(t.breeders?ANIMALS[t.species].cost:0);for(const [k,l]of Object.entries(t.equipment))price+=EQUIPMENT[k].costs.slice(k==='sponge'?1:0,l).reduce((a,b)=>a+b,0);return price;}
function fishPrice(id,grade=0){return Math.round(ANIMALS[id].price*(1+grade*.25));}
function salePlants(s,id,amount){demand(Number.isInteger(amount)&&amount>0&&stock(s,id)>=amount,'No eligible cuttings to sell.');s.inventory.plants[id]-=amount;credit(s,Math.floor(amount/1000*PLANTS[id].price));s.stats.plantsSold+=amount;s.stats.cropsSold[id]=true;}
function saleFish(s,t,limit=Infinity){let n=0;for(let grade=0;grade<3;grade++){const take=Math.min(t.young[grade],limit-n);if(take<=0)continue;t.young[grade]-=take;n+=take;credit(s,take*fishPrice(t.species,grade));}s.stats.fishSold+=n;return n;}
function harvest(s,t){const n=Math.floor(Math.max(0,t.biomass-t.reserve)/1000)*1000;if(n){t.biomass-=n;s.inventory.plants[t.crop]+=n;}return n;}
function allocateFish(s,id,count,grade=0){const result=[];for(const t of s.tanks.filter(t=>t.species===id)){for(let g=grade;g<3&&count;g++){const n=Math.min(t.young[g],count);if(n){t.young[g]-=n;count-=n;result.push({tank:t.id,species:id,grade:g,count:n});}}}demand(count===0,'The reserved fish are no longer available.');return result;}
function jobRoom(s,kind){if(kind==='setup')return s.jobs.filter(j=>j.kind==='setup').length<(s.unlocks.logistics?2:1);return s.jobs.filter(j=>['contract','listing'].includes(j.kind)).length<(s.unlocks.logistics?6:2);}
export function orderNeeds(s,kind,id) {
  const d=kind==='setup'?RECIPES[id]:CONTRACTS[id]; if(!d)return ['Unknown order.'];
  const needs=[];if(s.phase<d.phase)needs.push(`Chapter ${d.phase}`);
  if(kind==='setup'&&!s.unlocks.workshop)needs.push('Setup workshop');
  if(!jobRoom(s,kind))needs.push(kind==='setup'?'Free assembly bay':'Free dispatch slot');
  for(const [key,n] of Object.entries(d.fish||{})){const have=availableFish(s,key,d.grade||0);if(have<n)needs.push(`${n-have} ${d.grade?'selected ':''}${ANIMALS[key].name.toLowerCase()}`);}
  for(const [key,n] of Object.entries(d.plants||{}))if(stock(s,key)<n)needs.push(`${((n-stock(s,key))/1000).toFixed(1)} ${PLANTS[key].name}`);
  if((d.media||0)>s.inventory.media)needs.push(`${d.media-s.inventory.media} mature media`);
  for(const [key,n] of Object.entries(d.food||{}))if(s.inventory.food[key]<n)needs.push(`${n-s.inventory.food[key]} ${CULTURES[key].name}`);
  const parts=Math.max(0,(d.parts||0)-(s.inventory.frames?1800:0));if(s.cash<parts)needs.push(`${money(parts-s.cash)} for the frame/care kit`);
  return needs;
}
function makeOrder(s,kind,id){const needs=orderNeeds(s,kind,id);demand(!needs.length,'Needs '+needs.join(', ')+'.');const d=kind==='setup'?RECIPES[id]:CONTRACTS[id];const escrow={fish:[],plants:{...d.plants},media:d.media||0,food:{...d.food},cash:0,frames:0};for(const [key,n]of Object.entries(d.fish||{}))escrow.fish.push(...allocateFish(s,key,n,d.grade||0));for(const [key,n]of Object.entries(escrow.plants))s.inventory.plants[key]-=n;s.inventory.media-=escrow.media;for(const [key,n]of Object.entries(escrow.food))s.inventory.food[key]-=n;if(d.parts){escrow.frames=s.inventory.frames?1:0;s.inventory.frames-=escrow.frames;escrow.cash=Math.max(0,d.parts-escrow.frames*1800);charge(s,escrow.cash);}s.jobs.push({id:'j'+s.nextId++,kind,key:id,name:d.name,remaining:d.duration,duration:d.duration,price:d.price,escrow,final:s.finale.active});}
function finishJob(s,j){
  if(j.kind==='media'){s.inventory.media++;log(s,'A mature media module is ready to seed another tank.');return;}
  if(j.kind==='repair'){s.inventory.frames++;log(s,'Leak test passed. A reclaimed aquarium frame is ready.');return;}
  if(j.kind==='recovery'){credit(s,100);return;}
  credit(s,j.price);
  for(const f of j.escrow.fish)s.stats.fishSold+=f.count;
  for(const [key,n]of Object.entries(j.escrow.plants)){s.stats.plantsSold+=n;s.stats.cropsSold[key]=true;}
  if(j.kind==='contract'){s.stats.contracts++;if(j.final)s.finale.supply++;}
  if(j.kind==='setup'){s.stats.setups++;s.stats.recipes[j.key]=(s.stats.recipes[j.key]||0)+1;if(j.final&&!s.finale.delivered.includes(j.key))s.finale.delivered.push(j.key);}
  log(s,`${j.name} delivered · ${money(j.price)}. ${j.kind==='setup'?'Another complete little world.':'Your regulars know where to find you.'}`);
}
function cancelJob(s,id){const j=s.jobs.find(j=>j.id===id);demand(j,'That job has already finished.');if(j.escrow){for(const f of j.escrow.fish)requiredTank(s,f.tank).young[f.grade]+=f.count;for(const [key,n]of Object.entries(j.escrow.plants))s.inventory.plants[key]+=n;for(const [key,n]of Object.entries(j.escrow.food))s.inventory.food[key]+=n;s.inventory.media+=j.escrow.media;s.inventory.frames+=j.escrow.frames;s.cash+=j.escrow.cash;}else s.cash+=j.cost||0;s.jobs=s.jobs.filter(x=>x.id!==id);}
function simpleJob(s,kind){phaseCheck(s,kind==='media'?2:1);demand(s.jobs.filter(j=>j.kind===kind).length<2,'Both preparation slots are busy.');const cost=kind==='media'?300:1000;charge(s,cost);const duration=kind==='media'?300:180;s.jobs.push({id:'j'+s.nextId++,kind,name:kind==='media'?'Mature a media module':'Repair & leak-test a used tank',remaining:duration,duration,cost});}
function marketplace(s,t,kind){demand(jobRoom(s,'listing'),'Both marketplace slots are busy.');phaseCheck(s,2);const escrow={fish:[],plants:{},food:{},media:0,frames:0,cash:0};let price=0;if(kind==='fish'){for(let g=0;g<3;g++){if(t.young[g]){const n=t.young[g];escrow.fish.push({tank:t.id,species:t.species,count:n,grade:g});price+=n*fishPrice(t.species,g);t.young[g]=0;}}}else{const n=stock(s,t.crop);escrow.plants[t.crop]=n;price=n/1000*PLANTS[t.crop].price;s.inventory.plants[t.crop]=0;}demand(price>0,'No unreserved stock to list.');s.jobs.push({id:'j'+s.nextId++,kind:'listing',name:kind==='fish'?`${ANIMALS[t.species].name} marketplace lot`:`${PLANTS[t.crop].name} marketplace lot`,remaining:180,duration:180,price:Math.floor(price*1.35),escrow,final:false});}
function cultureInput(s,c,consume=false){const d=CULTURES[c.type];let owner,key;if(d.input==='nutrients'||d.input==='feed'){owner=s.inventory;key=d.input;}else if(d.input==='hornwort'){owner=s.inventory.plants;key='hornwort';}else{owner=s.inventory.food;key=d.input;}if(owner[key]<d.need)return false;if(consume)owner[key]-=d.need;return true;}
export function cultureView(s,c){const d=CULTURES[c.type];return {blocked:c.stock>=20?'Vessel full · harvest above the starter reserve':!cultureInput(s,c)?`Needs ${d.need===500?'0.5':d.need} ${d.input==='hornwort'?'hornwort biomass':d.input}`:'Growing',ready:Math.max(0,c.stock-2)};}
function harvestCulture(s,c){const n=Math.max(0,c.stock-2);c.stock-=n;s.inventory.food[c.type]+=n;return n;}
function moveYoung(s,from,to,count,asBreeders=false){demand(from.species,'Choose a source breeding line.');demand(!to.species||to.species===from.species,'The destination holds a different species.');demand(to.ready===0,'The destination is still commissioning.');demand(!habitat(to,from.species),habitat(to,from.species));const a=ANIMALS[from.species], v=tankView(s,to);demand(v.load+count*a.load<=v.capacity+.001,'The destination needs more safe capacity.');demand(from.young.reduce((a,b)=>a+b,0)>=count,'Wait for a full sale-ready group.');for(let g=0;g<3&&count;g++){const n=Math.min(count,from.young[g]);from.young[g]-=n;count-=n;if(asBreeders)to.breeders+=n;else to.young[g]+=n;}to.species=from.species;}
export function act(state,command){const s=clone(state);try{const {type,id,key,value,to}=command;demand(!s.paused||['pause','policy','reserve','settings','goal','rename','repeat','automedia'].includes(type),'Resume the room before changing its production.');let t=id?tankById(s,id):null;
  if(type==='harvest'){t=requiredTank(s,id);demand(harvest(s,t)>0,'Let at least one biomass grow above the protected reserve.');}
  else if(type==='sellPlants'){demand(PLANTS[key],'Unknown plant crop.');salePlants(s,key,stock(s,key));}
  else if(type==='sellFish'){t=requiredTank(s,id);demand(saleFish(s,t)>0,'Only mature, unreserved juveniles can be sold.');}
  else if(type==='replant'){t=requiredTank(s,id);const amount=1000;demand(stock(s,t.crop)>=amount,'Needs one loose cutting of this crop.');demand(t.biomass+amount<=tankView(s,t).plantCap,'This plant bed is full.');s.inventory.plants[t.crop]-=amount;t.biomass+=amount;}
  else if(type==='reserve'){t=requiredTank(s,id);demand(Number.isInteger(value)&&value>=4000&&value<=tankView(s,t).plantCap-1000,'Reserve must leave at least one biomass of growing room (minimum 4).');t.reserve=value;}
  else if(type==='plant'){t=requiredTank(s,id);demand(PLANTS[key],'Unknown plant.');phaseCheck(s,PLANTS[key].phase);demand(key!==t.crop,'This crop is already planted.');charge(s,PLANTS[key].seed);s.inventory.plants[t.crop]+=t.biomass;t.crop=key;t.biomass=4000;t.reserve=4000;t.settle=key==='crypt'?120:0;t.growthCarry=0;}
  else if(type==='equipment'){t=requiredTank(s,id);const e=EQUIPMENT[key];demand(e,'Unknown equipment.');phaseCheck(s,e.phase);const level=t.equipment[key];demand(level<e.costs.length,'This equipment is fully upgraded.');charge(s,e.costs[level]);t.equipment[key]++;const f=facility(s);demand(f.power<=f.powerCap,'Needs the dedicated circuit or more room power.');log(s,`${t.name}: ${e.names[level]} installed.`);}
  else if(type==='global'){const d=GLOBALS[key];demand(d,'Unknown room improvement.');phaseCheck(s,d.phase);demand(!s.unlocks[key],'Already installed.');if(key==='dispatcher')demand(s.stats.fishSold>=4,'Raise and sell your first four juveniles.');if(key==='workshop')demand(s.stats.cultureProduced>=4,'Produce four culture portions first.');charge(s,d.cost);s.unlocks[key]=1;demand(facility(s).space<=SPACE(s),'Expand the shelf to make room for the workshop.');if(key==='dispatcher'){s.tanks[0].policy={...s.tanks[0].policy,trim:true,plants:'cash',fish:'cash'};}log(s,`${d.name} is ready. ${d.note}`);}
  else if(type==='buyTank'){const d=FOOTPRINTS[key];demand(d,'Unknown tank footprint.');phaseCheck(s,d.phase);demand(s.tanks.length<12,'Your room supports twelve aquarium modules.');demand(facility(s).space+d.space<=SPACE(s),'The room needs more shelf space.');demand(facility(s).power+2<=POWER(s),'The room needs a larger power circuit.');charge(s,d.cost);const nt=tank('t'+s.nextId++,key,`Tank ${s.tanks.length+1}`);nt.ready=90;nt.biomass=4000;nt.equipment.sponge=1;s.tanks.push(nt);log(s,`${nt.name}: a ${d.name.toLowerCase()} begins its fishless check.`);}
  else if(type==='seedMedia'){t=requiredTank(s,id);demand(t.ready>10,'This aquarium is already established.');demand(s.inventory.media>0,'Mature a spare media module first.');s.inventory.media--;t.ready=10;}
  else if(type==='stock'){t=requiredTank(s,id);const a=ANIMALS[key];demand(a,'Unknown animal.');phaseCheck(s,a.phase);demand(!t.ready,'Finish the fishless commissioning check first.');if(a.utility){demand(!t.companions.includes(key),'This companion already lives here.');demand(tankView(s,t).load+a.load<=tankView(s,t).capacity,'No safe capacity for this companion.');charge(s,a.cost);t.companions.push(key);}else{demand(!t.species||t.species===key,'Use a separate tank for a different breeding line.');demand(!habitat(t,key),habitat(t,key));demand(t.equipment.sponge>0,'Install a fry-safe sponge first.');demand(tankView(s,t).load+a.group*a.load<=tankView(s,t).capacity,'Not enough safe space for this breeding group.');charge(s,a.cost);t.species=key;t.breeders+=a.group;}log(s,`${ANIMALS[key].name} settle into ${t.name}.`);}
  else if(type==='retain'){t=requiredTank(s,id);demand(t.species,'No breeding line here yet.');const a=ANIMALS[t.species];demand(t.young.reduce((a,b)=>a+b,0)>=a.group,'Wait for a complete mature group.');let n=a.group;for(let g=2;g>=0&&n;g--){const take=Math.min(n,t.young[g]);t.young[g]-=take;t.breeders+=take;n-=take;}}
  else if(type==='transfer'){t=requiredTank(s,id);const dest=requiredTank(s,to);demand(t!==dest,'Choose another aquarium.');moveYoung(s,t,dest,ANIMALS[t.species]?.group||4,!!value);}
  else if(type==='moveFry'){t=requiredTank(s,id);const dest=requiredTank(s,to);demand(t!==dest,'Choose another aquarium.');const c=t.cohorts[0];demand(c,'There is no growing cohort to move.');demand(!dest.species||dest.species===t.species,'The destination houses another species.');demand(!dest.ready,'Finish destination commissioning first.');demand(!habitat(dest,t.species),habitat(dest,t.species));demand(tankView(s,dest).load+c.count*ANIMALS[t.species].load<=tankView(s,dest).capacity,'The destination has insufficient nursery capacity.');dest.species=t.species;dest.cohorts.push(t.cohorts.shift());}
  else if(type==='policy'){t=requiredTank(s,id);demand(s.unlocks.dispatcher,'Unlock the surplus dispatcher first.');demand(['trim','plants','fish','food','nursery'].includes(key),'Unknown policy.');if(key==='trim')demand(typeof value==='boolean','Invalid trim policy.');if(key==='plants')demand(['cash','hold'].includes(value),'Invalid plant destination.');if(key==='fish')demand(['cash','hold','market'].includes(value),'Invalid fish destination.');if(key==='food')demand(['balanced','live'].includes(value),'Invalid feeding policy.');if(key==='nursery')demand(value===null||s.tanks.some(x=>x.id===value&&x.id!==id),'Choose a different destination.');t.policy[key]=value;}
  else if(type==='roomPolicy'){demand(s.unlocks.controller,'Install the fish room controller first.');for(const x of s.tanks){x.policy.trim=true;x.policy.plants=value==='cash'?'cash':'hold';x.policy.fish=value==='cash'?'cash':'hold';}}
  else if(type==='template'){t=requiredTank(s,id);demand(s.unlocks.controller,'Room templates need the fish room controller.');const fp=FOOTPRINTS[t.footprint];demand(s.tanks.length<12,'Room module limit reached.');demand(facility(s).space+fp.space<=SPACE(s),'Not enough shelf space.');demand(facility(s).power+tankView(s,t).power<=POWER(s),'Not enough circuit capacity.');demand(s.inventory.media>=1,'Needs one mature media module.');charge(s,templatePrice(t));s.inventory.media--;const nt=clone(t);nt.id='t'+s.nextId++;nt.name=t.name.slice(0,37)+' II';nt.ready=10;nt.biomass=4000;nt.reserve=4000;nt.young=[0,0,0];nt.cohorts=[];nt.companions=[];nt.breeders=t.breeders?ANIMALS[t.species].group:0;nt.traits={appearance:0,yield:0};nt.selection=null;nt.water={a:0,i:0,n:12};nt.pulse=0;nt.growthCarry=0;nt.yieldCarry=0;nt.policy.nursery=null;s.tanks.push(nt);}
  else if(type==='culture'){phaseCheck(s,3);const d=CULTURES[key];demand(d,'Unknown culture.');demand(!s.cultures.some(c=>c.type===key),'This culture vessel is already installed.');demand(facility(s).space<SPACE(s)&&facility(s).power<POWER(s),'Needs one free space and power unit.');charge(s,d.cost);s.cultures.push({type:key,stock:2,progress:0,auto:false});log(s,`${d.name}: protect the starter, harvest its surplus.`);}
  else if(type==='harvestCulture'){const c=s.cultures.find(c=>c.type===key);demand(c,'Install this culture first.');demand(harvestCulture(s,c)>0,'The starter needs time to grow.');}
  else if(type==='cultureAuto'){const c=s.cultures.find(c=>c.type===key);demand(c,'Install this culture first.');c.auto=!c.auto;}
  else if(type==='supplies'){demand(['feed','nutrients','food'].includes(key),'Unknown supply.');if(key==='food'){demand(CULTURES[value]&&value!=='greenwater','Choose a live food.');charge(s,500);s.inventory.food[value]+=5;}else{charge(s,200);s.inventory[key]+=key==='feed'?10:20;}}
  else if(type==='order'){makeOrder(s,key,id);}
  else if(type==='cancel'){cancelJob(s,id);}
  else if(type==='market'){t=requiredTank(s,id);marketplace(s,t,key);}
  else if(type==='media'||type==='repair'){simpleJob(s,type);}
  else if(type==='sellFrame'){demand(s.inventory.frames>0,'Repair a frame first.');s.inventory.frames--;credit(s,1600);}
  else if(type==='recovery'){demand(s.jobs.every(j=>j.kind!=='recovery'),'The fish-store shift is already running.');demand(s.cash<2000,'Your own production is ready to fund the next steps.');s.jobs.push({id:'j'+s.nextId++,kind:'recovery',name:'Help at the local fish store',remaining:60,duration:60,cost:0});}
  else if(type==='repeat'){demand(s.unlocks.controller,'Repeat contracts need the fish room controller.');demand(CONTRACTS[key],'Unknown contract.');s.repeat=s.repeat.includes(key)?s.repeat.filter(k=>k!==key):[...s.repeat,key];}
  else if(type==='automedia'){demand(s.unlocks.controller,'Install the room controller first.');s.autoMedia=!s.autoMedia;}
  else if(type==='selection'){phaseCheck(s,5);t=requiredTank(s,id);demand(t.breeders>0,'This tank needs a breeding group.');demand(['appearance','yield'].includes(key),'Choose appearance or reliable yield.');demand(!t.selection,'Finish the current selection project first.');demand(t.traits[key]<2,'This line has mastered that trait.');charge(s,3000*(t.traits[key]+1));t.selection={trait:key,batches:0,key:'selection'+s.nextId++};t.policy.food='live';log(s,`${t.name}: a directed ${key==='appearance'?'appearance':'reliable yield'} project begins. Two live-food-supported cohorts will establish the trait.`);}
  else if(type==='rehome'){t=requiredTank(s,id);demand(!held(s,id),'Deliver or cancel this tank’s reserved orders first.');if(t.species){saleFish(s,t);credit(s,Math.floor(t.breeders*ANIMALS[t.species].cost/ANIMALS[t.species].group*.5));}t.species=null;t.breeders=0;t.young=[0,0,0];t.cohorts=[];t.companions=[];t.selection=null;t.traits={appearance:0,yield:0};t.pulse=0;t.yieldCarry=0;t.policy.nursery=null;for(const x of s.tanks)if(x.policy.nursery===id)x.policy.nursery=null;log(s,`${t.name}: livestock rehomed. The planted aquarium is ready for a new line.`);}
  else if(type==='retireTank'){t=requiredTank(s,id);demand(s.tanks.length>1,'Keep at least one aquarium in the room.');demand(!t.species&&!t.companions.length&&!held(s,id),'Rehome this tank’s livestock before retiring the frame.');let refund=FOOTPRINTS[t.footprint].cost;for(const [k,l]of Object.entries(t.equipment))refund+=EQUIPMENT[k].costs.slice(k==='sponge'?1:0,l).reduce((a,b)=>a+b,0);credit(s,Math.floor(refund*.5));s.inventory.plants[t.crop]+=t.biomass;for(const x of s.tanks)if(x.policy.nursery===id)x.policy.nursery=null;s.tanks=s.tanks.filter(x=>x.id!==id);log(s,`${t.name} retired. Its plants were collected and its shelf space is free.`);}
  else if(type==='water'){t=requiredTank(s,id);t.water.a*=.3;t.water.i*=.3;t.water.n*=.3;}
  else if(type==='rename'){t=requiredTank(s,id);demand(typeof value==='string'&&value.trim().length>0&&value.length<=40,'Use a name of 1–40 characters.');t.name=value.trim();}
  else if(type==='finale'){phaseCheck(s,6);demand(!s.finale.active,'The project is already under way.');s.finale.active=true;log(s,'The Independent Fish Room project begins. Three setups, three supply deliveries, and a room that keeps running.');}
  else if(type==='pause'){s.paused=!s.paused;}
  else if(type==='settings'){demand(['motion','sound','textSize'].includes(key),'Unknown preference.');demand(key==='textSize'?[1,1.15,1.3].includes(value):typeof value==='boolean','Invalid preference.');s.settings[key]=value;}
  else if(type==='goal'){demand(value===null||(typeof value==='string'&&value.length<=160),'Keep the goal under 160 characters.');s.goal=value;}
  else throw new Error('Unknown action.');
  // Chapter transitions may occur on commands; finale time is only advanced in ticks.
  progression(s);
  return {ok:true,state:s,message:'Done.'};
}catch(error){return {ok:false,state,message:error.message};}}

export function advance(state,seconds){demand(Number.isFinite(seconds)&&seconds>=0&&seconds<=OFFLINE_CAP*7,'Invalid elapsed time.');const s=clone(state);if(s.paused)return s;const ticks=Math.floor(s.remainder+seconds+1e-8);s.remainder=Math.max(0,s.remainder+seconds-ticks);
  for(let tick=0;tick<ticks;tick++){
    s.time++;
    for(const j of s.jobs)j.remaining--;
    const done=s.jobs.filter(j=>j.remaining<=0);s.jobs=s.jobs.filter(j=>j.remaining>0);for(const j of done)finishJob(s,j);
    for(const t of s.tanks){
      if(t.ready>0)t.ready--;
      if(t.settle>0)t.settle--;
      for(const c of t.cohorts)c.remaining--;
      for(const c of t.cohorts.filter(c=>c.remaining<=0)){
        t.young[c.grade]+=c.count;s.stats.bred[t.species]=true;
        if(t.selection&&c.selected===t.selection.key){t.selection.batches++;if(t.selection.batches>=2){const trait=t.selection.trait;t.traits[trait]++;s.stats.strains++;t.selection=null;log(s,`${t.name}: ${trait==='appearance'?'a selected appearance':'a reliable breeding yield'} is established. The new trait is permanent.`);}}
      }
      t.cohorts=t.cohorts.filter(c=>c.remaining>0);
    }
    // Accepted orders get priority over surplus sales. Never consume protected breeders.
    for(const key of s.repeat)if(!s.jobs.some(j=>j.kind==='contract'&&j.key===key)&&!orderNeeds(s,'contract',key).length)makeOrder(s,'contract',key);
    for(const t of s.tanks){
      if(t.policy.nursery&&t.species){const dest=tankById(s,t.policy.nursery);const a=ANIMALS[t.species];if(dest&&t.young.reduce((n,x)=>n+x,0)>=a.group&&!dest.ready&&(!dest.species||dest.species===t.species)&&!habitat(dest,t.species)&&tankView(s,dest).load+a.group*a.load<=tankView(s,dest).capacity)moveYoung(s,t,dest,a.group);}
      if(t.policy.trim)harvest(s,t);
      // A repeated plant contract reserves its exact next bill before cash overflow.
      if(t.policy.plants==='cash'){const reserve=s.repeat.reduce((n,k)=>n+(CONTRACTS[k].plants[t.crop]||0),0);const n=stock(s,t.crop)-reserve;if(n>=1000)salePlants(s,t.crop,n);}
      if(t.policy.fish==='cash'&&t.species){const reserve=s.repeat.reduce((n,k)=>n+(CONTRACTS[k].fish[t.species]||0),0);const excess=availableFish(s,t.species)-reserve;if(excess>0)saleFish(s,t,excess);}
      if(t.policy.fish==='market'&&t.young.reduce((a,b)=>a+b,0)>0&&jobRoom(s,'listing')&&s.phase>=2)marketplace(s,t,'fish');
      const v=tankView(s,t), e=t.equipment, p=PLANTS[t.crop], a=ANIMALS[t.species];
      const load=v.load*.25, bio=[1,4,9,19][e.sponge];
      const incoming=t.water.a+load/60;const first=Math.min(incoming,bio/60);t.water.a=incoming-first;
      const nit=t.water.i+first;const second=Math.min(nit,bio/60);t.water.i=nit-second;
      t.water.n+=second+(t.water.n<12?.25/60:0);
      const potential=t.settle?0:Math.min((v.plantCap-t.biomass)/1000,v.potential/60);
      const growth=Math.min(potential,t.water.n*p.export*(1+.35*e.roots)*(t.companions.includes('nerite')?1.15:1));
      t.water.n-=growth/(p.export*(1+.35*e.roots)*(t.companions.includes('nerite')?1.15:1));
      const exact=growth*1000+t.growthCarry, whole=Math.floor(exact+1e-8);t.growthCarry=Math.max(0,exact-whole);t.biomass=Math.min(v.plantCap,t.biomass+whole);
      const exchange=Math.exp(-(.05+.12*e.exchange)/60);for(const k of ['a','i','n'])t.water[k]=Math.max(0,t.water[k]*exchange);
      s.inventory.nutrients=Math.min(1000,s.inventory.nutrients+load/120);
      if(t.ready||!a||!t.breeders||habitat(t,t.species))continue;
      t.pulse=Math.min(v.pulseEvery,t.pulse+1);
      if(t.pulse+1e-7<v.pulseEvery||t.water.n>50)continue;
      const free=Math.floor((v.capacity-v.load+1e-7)/a.load);if(free<1)continue;
      const foodType=['daphnia','infusoria','microworms'].find(k=>s.inventory.food[k]>=1);
      const boosted=t.policy.food==='live'&&!!foodType;
      const base=Math.floor(t.breeders/a.group)*a.batch*(1+.25*e.nursery+.1*e.heater+.15*t.traits.yield)*(t.crop==='moss'?1.3:1)*(boosted?1.25:1)+t.yieldCarry;
      const count=Math.min(free,Math.floor(base));if(!count)continue;
      if(boosted)s.inventory.food[foodType]--;
      t.yieldCarry=base-Math.floor(base);t.pulse=0;
      t.cohorts.push({count,remaining:a.mature,grade:t.traits.appearance,selected:t.selection&&boosted?t.selection.key:null});
    }
    for(const c of s.cultures){const d=CULTURES[c.type];if(c.auto)harvestCulture(s,c);if(c.stock>=20||!cultureInput(s,c))continue;c.progress++;if(c.progress>=d.duration){cultureInput(s,c,true);const n=Math.min(d.yield,20-c.stock);c.stock+=n;s.stats.cultureProduced+=n;c.progress=0;}}
    if(s.autoMedia&&s.inventory.media<6&&!s.jobs.some(j=>j.kind==='media')&&s.cash>=300)simpleJob(s,'media');
    progression(s,1);
  }
  return s;
}

function plain(x){return !!x&&typeof x==='object'&&!Array.isArray(x);}
export function validate(s){
  demand(plain(s)&&s.version===VERSION,'Unsupported campaign version.');
  const scan=(x,depth=0)=>{demand(depth<20,'Save nesting is too deep.');if(typeof x==='number')demand(Number.isFinite(x)&&x>=0&&x<=1e12,'Save contains an invalid number.');if(Array.isArray(x)){demand(x.length<1000,'Save array is too large.');x.forEach(v=>scan(v,depth+1));}else if(plain(x)){demand(Object.keys(x).length<150,'Save object is too large.');for(const [k,v]of Object.entries(x)){demand(!['__proto__','constructor','prototype'].includes(k),'Invalid save key.');scan(v,depth+1);}}};scan(s);
  const integer=x=>Number.isSafeInteger(x)&&x>=0;
  const finite=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
  const member=(map,key)=>typeof key==='string'&&Object.hasOwn(map,key);
  demand(finite(s.remainder)&&typeof s.autoMedia==='boolean','Missing simulation state.');
  demand(integer(s.cash)&&integer(s.phase)&&s.phase>=1&&s.phase<=6&&integer(s.nextId)&&integer(s.time)&&s.remainder<1,'Invalid campaign balances or clock.');
  demand(typeof s.paused==='boolean'&&Array.isArray(s.tanks)&&s.tanks.length>=1&&s.tanks.length<=12,'Invalid room.');
  demand(plain(s.inventory)&&plain(s.inventory.plants)&&plain(s.inventory.food)&&plain(s.unlocks)&&plain(s.stats)&&plain(s.stats.bred)&&plain(s.stats.cropsSold)&&plain(s.stats.recipes),'Missing production records.');
  demand(finite(s.inventory.nutrients),'Invalid nutrient inventory.');
  for(const k of ['earned','fishSold','plantsSold','contracts','setups','cultureProduced','strains'])demand(integer(s.stats[k]),'Invalid production totals.');
  for(const t of s.tanks)for(const k of ['ready','growthCarry','settle','pulse','yieldCarry'])demand(finite(t[k]),'Missing aquarium timer.');
  for(const k of Object.keys(PLANTS))demand(integer(s.inventory.plants[k]),'Invalid plant inventory.');
  for(const k of Object.keys(CULTURES))demand(integer(s.inventory.food[k]),'Invalid culture inventory.');
  for(const k of ['media','frames','feed'])demand(integer(s.inventory[k]),'Invalid stored supplies.');
  for(const k of Object.keys(GLOBALS))demand([0,1].includes(s.unlocks[k]),'Invalid room unlock.');
  demand(Array.isArray(s.jobs)&&s.jobs.length<=20&&Array.isArray(s.cultures)&&s.cultures.length<=4&&Array.isArray(s.repeat)&&s.repeat.every(k=>member(CONTRACTS,k))&&new Set(s.repeat).size===s.repeat.length,'Invalid work queues.');
  const ids=new Set();for(const t of s.tanks){demand(typeof t.id==='string'&&!ids.has(t.id),'Duplicate aquarium ID.');ids.add(t.id);demand(typeof t.name==='string'&&t.name.length<=40&&member(FOOTPRINTS,t.footprint)&&member(PLANTS,t.crop)&&(!t.species||member(ANIMALS,t.species)&&!ANIMALS[t.species].utility),'Invalid aquarium definition.');demand(integer(t.biomass)&&integer(t.reserve)&&t.reserve>=4000&&integer(t.breeders)&&Array.isArray(t.young)&&t.young.length===3&&t.young.every(integer),'Invalid living stock.');demand(Array.isArray(t.cohorts)&&t.cohorts.length<100&&t.cohorts.every(c=>integer(c.count)&&c.count>0&&c.remaining>0&&c.remaining<=3600&&[0,1,2].includes(c.grade)&&(c.selected===null||typeof c.selected==='string')),'Invalid cohort.');demand(plain(t.equipment)&&Object.keys(EQUIPMENT).every(k=>integer(t.equipment[k])&&t.equipment[k]<=EQUIPMENT[k].costs.length),'Invalid equipment tier.');demand(Array.isArray(t.companions)&&t.companions.every(k=>member(ANIMALS,k)&&ANIMALS[k].utility)&&new Set(t.companions).size===t.companions.length,'Invalid companions.');demand(plain(t.water)&&['a','i','n'].every(k=>typeof t.water[k]==='number')&&plain(t.traits)&&[0,1,2].includes(t.traits.appearance)&&[0,1,2].includes(t.traits.yield),'Invalid tank conditions.');demand(t.selection===null||(plain(t.selection)&&['appearance','yield'].includes(t.selection.trait)&&[0,1].includes(t.selection.batches)&&typeof t.selection.key==='string'),'Invalid selection project.');demand(plain(t.policy)&&typeof t.policy.trim==='boolean'&&['hold','cash'].includes(t.policy.plants)&&['hold','cash','market'].includes(t.policy.fish)&&['balanced','live'].includes(t.policy.food),'Invalid production policy.');demand(t.policy.nursery===null||s.tanks.some(x=>x.id===t.policy.nursery&&x.id!==t.id),'Invalid nursery route.');demand(t.biomass<=tankView(s,t).plantCap&&t.reserve<tankView(s,t).plantCap,'Plant bed exceeds capacity.');if(!t.species)demand(t.breeders===0&&t.young.every(n=>n===0)&&t.cohorts.length===0,'Unassigned livestock.');}
  const jobIds=new Set();for(const j of s.jobs){demand(typeof j.id==='string'&&!jobIds.has(j.id),'Duplicate work order.');jobIds.add(j.id);demand(['setup','contract','listing','media','repair','recovery'].includes(j.kind)&&j.remaining>0&&j.remaining<=j.duration&&j.duration<=86400,'Invalid job timer.');if(['setup','contract','listing'].includes(j.kind)){demand(integer(j.price)&&plain(j.escrow)&&Array.isArray(j.escrow.fish)&&plain(j.escrow.plants)&&plain(j.escrow.food),'Invalid escrow.');if(j.kind!=='listing')demand(member(j.kind==='setup'?RECIPES:CONTRACTS,j.key),'Unknown recipe.');for(const f of j.escrow.fish)demand(tankById(s,f.tank)?.species===f.species&&integer(f.count)&&[0,1,2].includes(f.grade),'Invalid reserved fish.');for(const [k,n]of Object.entries(j.escrow.plants))demand(member(PLANTS,k)&&integer(n),'Invalid reserved plants.');for(const [k,n]of Object.entries(j.escrow.food))demand(member(CULTURES,k)&&integer(n),'Invalid reserved food.');for(const k of ['media','frames','cash'])demand(integer(j.escrow[k]),'Invalid escrow amount.');}else demand(integer(j.cost||0),'Invalid job cost.');}
  for(const t of s.tanks)demand(tankView(s,t).load<=tankView(s,t).capacity+.01,'Reserved livestock exceeds aquarium capacity.');
  for(const c of s.cultures)demand(member(CULTURES,c.type)&&integer(c.stock)&&c.stock>=2&&c.stock<=20&&finite(c.progress)&&c.progress<CULTURES[c.type].duration&&typeof c.auto==='boolean','Invalid culture vessel.');demand(new Set(s.cultures.map(c=>c.type)).size===s.cultures.length,'Duplicate culture vessel.');
  demand(facility(s).space<=SPACE(s)&&facility(s).power<=POWER(s),'Room budgets exceeded.');
  demand(plain(s.finale)&&typeof s.finale.active==='boolean'&&Array.isArray(s.finale.delivered)&&s.finale.delivered.every(k=>member(RECIPES,k))&&integer(s.finale.supply)&&integer(s.finale.progress),'Invalid final project.');demand(s.finale.completedAt===null||(integer(s.finale.completedAt)&&s.finale.completedAt<=s.time&&s.finale.progress>=1800),'Invalid campaign completion.');
  demand(plain(s.settings)&&typeof s.settings.motion==='boolean'&&typeof s.settings.sound==='boolean'&&[1,1.15,1.3].includes(s.settings.textSize),'Invalid settings.');demand(s.goal===null||(typeof s.goal==='string'&&s.goal.length<=160),'Invalid goal.');demand(Array.isArray(s.history)&&s.history.length<=70&&s.history.every(h=>integer(h.at)&&typeof h.text==='string'&&h.text.length<1000),'Invalid notebook.');return true;
}
export function encodeSave(s,now=Date.now()){validate(s);return JSON.stringify({schema:'little-current-campaign',version:VERSION,savedAt:now,state:s});}
export function decodeSave(raw,now=Date.now(),catchup=true){demand(typeof raw==='string'&&raw.length<=2_000_000,'Save file is too large.');const data=JSON.parse(raw);demand(data.schema==='little-current-campaign'&&data.version===VERSION,'This is not a supported Little Current campaign save. Demo saves use a different economy.');demand(Number.isFinite(data.savedAt)&&data.savedAt>=0,'Invalid saved timestamp.');validate(data.state);const away=Math.max(0,(now-data.savedAt)/1000),credited=data.state.paused?0:Math.min(away,OFFLINE_CAP);return {state:catchup?advance(data.state,credited):data.state,away,credited,savedAt:data.savedAt};}


