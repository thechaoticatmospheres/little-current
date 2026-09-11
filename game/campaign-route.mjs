// A reproducible integration playthrough. Every balance change uses public player actions.
import {initialState,act,advance,validate,orderNeeds} from './engine.mjs';
import {ANIMALS,PLANTS} from './content.mjs';
export function runCampaign(onStage=()=>{}){
  let s=initialState(),commands=0;const milestones=[],keepPlants=new Set(),keepFish=new Set();
  const doAction=c=>{const r=act(s,c);if(!r.ok)throw new Error(`${JSON.stringify(c)} at ${s.time}s: ${r.message}`);s=r.state;commands++;return s;};
  const maybe=c=>{const r=act(s,c);if(r.ok){s=r.state;commands++;}return r.ok;};
  function collect(){for(const t of [...s.tanks])maybe({type:'harvest',id:t.id});for(const key of Object.keys(PLANTS))if(!keepPlants.has(key)&&s.inventory.plants[key])doAction({type:'sellPlants',key});for(const t of [...s.tanks])if(t.species&&!keepFish.has(t.species)&&t.young.some(Boolean))doAction({type:'sellFish',id:t.id});}
  function until(test,label,max=36000){const start=s.time;while(!test()){if(s.time-start>max)throw new Error(`Route stalled: ${label}; phase ${s.phase}, cash ${s.cash}, t=${s.time}, inventory=${JSON.stringify(s.inventory)}`);s=advance(s,30);collect();validate(s);}return s;}
  function funds(n){collect();until(()=>s.cash>=n,'earn '+n);}
  function buy(c,n){funds(n);return doAction(c);}
  function stage(label){validate(s);const m={label,time:s.time,cash:s.cash,phase:s.phase};milestones.push(m);onStage(m,s);}
  function order(kind,id){until(()=>!orderNeeds(s,kind,id).length,`${kind} ${id}`);doAction({type:'order',key:kind,id});until(()=>!s.jobs.some(j=>j.kind===kind&&j.key===id),`deliver ${id}`);}
  function media(){buy({type:'media'},300);until(()=>s.inventory.media>0,'mature media');}
  function holdPolicies(){for(const t of s.tanks){doAction({type:'policy',id:t.id,key:'plants',value:'hold'});doAction({type:'policy',id:t.id,key:'fish',value:'hold'});}}
  funds(2000);doAction({type:'equipment',id:'t1',key:'sponge'});doAction({type:'stock',id:'t1',key:'guppy'});
  until(()=>s.stats.fishSold>=4,'first home-grown sales');buy({type:'global',key:'dispatcher'},1000);holdPolicies();
  buy({type:'buyTank',key:'starter'},3200);const shrimpId=s.tanks.at(-1).id;stage('Chapter 2');
  buy({type:'global',key:'rack'},8000);buy({type:'global',key:'circuit'},6000);
  buy({type:'plant',id:shrimpId,key:'moss'},2400);buy({type:'stock',id:shrimpId,key:'shrimp'},3000);
  keepPlants.add('hornwort');order('contract','plants');order('contract','plants');keepPlants.delete('hornwort');
  until(()=>s.phase>=3,'two mature species');stage('Chapter 3');
  buy({type:'buyTank',key:'long'},6500);const fernId=s.tanks.at(-1).id;
  buy({type:'plant',id:fernId,key:'fern'},3800);
  buy({type:'culture',key:'greenwater'},2500);doAction({type:'cultureAuto',key:'greenwater'});
  until(()=>s.stats.cultureProduced>=4,'culture production');buy({type:'global',key:'workshop'},12000);stage('Chapter 4');
  // Keep income flowing until the expensive controller is funded, then assemble.
  buy({type:'global',key:'controller'},45000);buy({type:'global',key:'logistics'},15000);
  keepPlants.add('hornwort');keepPlants.add('fern');keepFish.add('guppy');media();order('setup','guppy');media();order('setup','planted');keepFish.delete('guppy');stage('Chapter 5');
  buy({type:'global',key:'room'},60000);
  buy({type:'buyTank',key:'long'},6500);const danioId=s.tanks.at(-1).id;
  buy({type:'equipment',id:danioId,key:'sponge'},3500);buy({type:'equipment',id:danioId,key:'nursery'},1800);buy({type:'stock',id:danioId,key:'danio'},4000);
  keepPlants.add('moss');keepFish.add('shrimp');media();order('setup','shrimp');keepFish.delete('shrimp');
  for(const trait of ['appearance','yield']){buy({type:'selection',id:danioId,key:trait},3000);for(let n=0;n<4;n++)buy({type:'supplies',key:'food',value:'infusoria'},500);until(()=>!s.tanks.find(t=>t.id===danioId).selection,'finish '+trait+' selection');}
  until(()=>s.phase===6,'final chapter');stage('Chapter 6');
  doAction({type:'finale'});keepFish.add('guppy');keepFish.add('danio');
  for(const id of ['guppy','planted','breeder']){media();if(id==='breeder'){// The selected line no longer needs to consume the recipe's live food.
      doAction({type:'policy',id:danioId,key:'food',value:'balanced'});buy({type:'supplies',key:'food',value:'infusoria'},500);
    }order('setup',id);}
  keepFish.delete('guppy');keepFish.delete('danio');for(let i=0;i<3;i++)order('contract','plants');
  until(()=>s.finale.completedAt!==null,'30-minute room verification');stage('Complete');
  return {state:s,milestones,commands};
}
