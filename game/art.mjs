import {ANIMALS,PLANTS,FOOTPRINTS} from './content.mjs';
let template=null;
const ns='http://www.w3.org/2000/svg';
export async function loadArt(){const response=await fetch('../design-styles/painted.svg');if(!response.ok)throw new Error('Aquarium artwork could not load.');template=new DOMParser().parseFromString(await response.text(),'image/svg+xml').documentElement;}
function group(markup){const g=document.createElementNS(ns,'g');g.innerHTML=markup;return g;}
function animalArt(id,color){const a=ANIMALS[id];
  if(a.shape==='snail')return `<path d="M-18 8Q0-3 23 7L26 13H-20Z" fill="#b5bd91"/><circle cx="0" cy="0" r="13" fill="${color}" stroke="#63795f" stroke-width="2"/><path d="M6 3C-8 12-13-4-2-8C9-12 11 2 2 3C-3 4-4-1 0-2" fill="none" stroke="#6c7152" stroke-width="2"/><path d="M17 6L25-4M20 7L30 0" stroke="#b7bfa4" fill="none"/>`;
  if(a.shape==='shrimp')return `<path d="M-21 3Q-10-16 8-6L22 5 5 8-10 3-22 10Z" fill="${color}" stroke="#6f7265" stroke-width="1"/><path d="M-12-4L-9 8M-4-8L-2 9M5-6L9 8M-12 8L-15 15M-3 8L-2 16M7 8L10 16M20 2Q36-12 44-7M22 4L42 3" stroke="#ddc3a2" fill="none" stroke-width="1.4"/><circle cx="18" cy="1" r="1.6" fill="#203e39"/>`;
  const body=a.shape==='round'?'M-14 0Q0-22 23-5Q41 5 18 18Q-3 25-14 0Z':a.shape==='bottom'?'M-23 1Q-11-10 18-7L32 2Q4 13-23 1Z':'M-12 0Q4-14 26-4L34 2Q12 15-12 0Z';
  return `<path d="M-10 0L-34-17Q-28-2-35 15L-10 4Z" fill="${color}"/><path d="${body}" fill="${color}"/><path d="M0-8L9-18 18-8M7 10L13 20 22 9" fill="${color}" opacity=".85"/>${a.shape==='stripe'?'<path d="M-6-2L25 1M-3 4L24 5" stroke="#39565b" stroke-width="3"/>':''}${a.shape==='bottom'?'<path d="M27 3L38 10M29 2L41 3" stroke="#c8c5a2"/>':''}<path d="M-4-3Q11-9 23-2" fill="none" stroke="#f4d6a4" stroke-width="2" opacity=".65"/><circle cx="27" cy="0" r="2" fill="#193e3b"/>`;
}
export function renderAquarium(mount,s,t,view){if(!template){mount.textContent='The aquarium illustration is loading…';return;}
  const svg=document.importNode(template,true);svg.setAttribute('viewBox','75 73 650 450');svg.classList.add('living-aquarium');
  svg.querySelector('title').textContent=t.name;
  svg.querySelector('desc').textContent=`${FOOTPRINTS[t.footprint].name}, ${PLANTS[t.crop].name}, ${view.count} ${t.species?ANIMALS[t.species].name:'fish'}. ${view.blocker}. Hardware sits naturally behind the plants.`;
  svg.querySelectorAll('.swim').forEach(el=>el.remove());
  svg.querySelector('[data-upgrade="plants"]')?.remove();
  svg.querySelectorAll('use[href="#paint-fern"]').forEach(el=>el.remove());
  svg.querySelector('.starter-only').style.display=t.equipment.light?'none':'';
  const visible={sponge:t.equipment.sponge>0,heater:true,lighting:t.equipment.light>0,nursery:t.equipment.nursery>0,feeder:t.equipment.feeder>0,automation:t.equipment.exchange>0||s.unlocks.dispatcher>0,sensor:t.equipment.sensor>0};
  const anchor=svg.lastElementChild;
  for(const el of [...svg.querySelectorAll('[data-upgrade]')]){el.style.display=visible[el.dataset.upgrade]?'':'none';svg.insertBefore(el,anchor);if(el.dataset.upgrade==='heater'&&!t.equipment.heater)el.setAttribute('opacity','.48');}
  if(t.equipment.sponge>=2){const second=svg.querySelector('[data-upgrade="sponge"]').cloneNode(true);second.setAttribute('transform','translate(-58 24) scale(.92)');second.removeAttribute('data-upgrade');svg.insertBefore(second,anchor);}
  if(t.equipment.sponge>=3)svg.insertBefore(group('<rect x="600" y="375" width="57" height="32" rx="8" fill="#384c45" stroke="#a1ab88"/><path d="M606 381H650M606 389H650M606 397H650" stroke="#68795f"/>'),anchor);
  if(t.equipment.light>=2)svg.insertBefore(group('<rect x="211" y="109" width="332" height="8" rx="4" fill="#8b9278"/><path d="M217 120H537" stroke="#f1dc95" stroke-width="3"/>'),anchor);
  if(t.equipment.cave)svg.insertBefore(group('<path d="M450 412Q448 352 490 359Q531 364 530 415Z" fill="#af7759" stroke="#6e6850" stroke-width="2"/><ellipse cx="496" cy="394" rx="21" ry="20" fill="#253e3c"/>'),anchor);
  if(t.equipment.substrate)svg.insertBefore(group(`<path d="M118 412Q270 391 407 411T683 407V443H118Z" fill="${t.equipment.substrate===2?'#a39167':'#b29c70'}" opacity=".62"/>`),anchor);
  if(t.equipment.calm)svg.insertBefore(group('<path d="M583 147H677V161H583Z" fill="#bdc4a0" opacity=".7"/><path d="M588 154H674" stroke="#547c6b" stroke-width="3"/>'),anchor);
  if(t.equipment.nursery>=2)svg.insertBefore(group('<path d="M552 166V420" stroke="#b7c7ad" stroke-width="5" opacity=".65"/><path d="M557 170V414" stroke="#5c8f82" stroke-width="2" stroke-dasharray="3 5"/>'),anchor);
  if(t.equipment.feeder>=2)svg.insertBefore(group('<rect x="485" y="115" width="25" height="28" rx="5" fill="#a79976"/><path d="M490 143L492 158H500L502 143" fill="#718e7d"/>'),anchor);
  if(t.equipment.exchange>=2)svg.insertBefore(group('<path d="M666 388V160Q667 129 643 131H621" fill="none" stroke="#adc0a8" stroke-width="5" opacity=".7"/><path d="M674 390V161" stroke="#486e63" stroke-width="3"/>'),anchor);
  if(t.equipment.roots>=2)svg.insertBefore(group('<path d="M300 119H364V144H300Z" fill="#958365"/><path d="M312 142Q301 220 327 292M345 142Q365 252 336 320" stroke="#babb8c" fill="none" stroke-width="3"/><path d="M325 121Q287 82 306 77Q332 82 335 115Q343 74 369 83Q384 108 336 122Z" fill="#839d65"/>'),anchor);
  if(t.equipment.roots||t.crop==='pothos')svg.insertBefore(group(`<path d="M210 140V112H276V143Z" fill="#a38e6c"/><path d="M222 140Q202 231 240 278M237 142Q251 208 226 248M256 141Q277 231 261 296" stroke="#c4bc91" fill="none" stroke-width="2"/><path d="M231 117Q188 72 215 73Q243 73 244 112Q255 59 282 75Q302 94 247 120Z" fill="#829766"/>`),anchor);
  const p=PLANTS[t.crop], amount=Math.min(15,Math.max(2,Math.ceil(t.biomass/2200)));
  const spots=[175,510,226,565,298,469,610,357,153,405,535,260,580,322,645];let foliage='';
  for(let i=0;i<amount;i++){const x=spots[i],y=412-i%3*4,scale=.5+Math.min(1,t.biomass/16000)*.45+(i%3)*.13;
    if(p.kind==='moss')foliage+=`<path d="M${x-24} ${y}Q${x-25} ${y-24} ${x-12} ${y-19}Q${x} ${y-40} ${x+10} ${y-21}Q${x+30} ${y-28} ${x+29} ${y}Z" fill="${p.color}" stroke="#658063"/>`;
    else if(p.kind==='floating')foliage+=`<ellipse cx="${x}" cy="150" rx="24" ry="7" fill="${p.color}"/><path d="M${x} 156Q${x-12} 190 ${x+4} 233M${x+8} 153L${x+17} 205" fill="none" stroke="#c3c5a0" opacity=".7"/>`;
    else foliage+=`<g class="plant-sway" style="--delay:-${i*1.7}s"><use href="#paint-${p.kind==='fern'||p.kind==='emergent'?'fern':'grass'}" transform="translate(${x} ${y}) scale(${i%2?-scale:scale} ${scale*(p.kind==='grass'?1.8:1.2)})" style="filter:hue-rotate(${t.crop==='rotala'?310:t.crop==='crypt'?330:0}deg)"/></g>`;
  }
  // Equipment belongs to the scene; dense planting may naturally overlap it.
  svg.insertBefore(group(foliage),anchor);
  if(t.species){const a=ANIMALS[t.species],n=Math.min(11,Math.max(0,t.breeders+view.young+view.promised));let fish='';for(let i=0;i<n;i++){const bottom=['snail','shrimp','bottom'].includes(a.shape);const x=245+(i*89)%345,y=bottom?392-(i%3)*15:235+(i*37)%133,scale=.7+(i%3)*.13;fish+=`<g transform="translate(${x} ${y}) scale(${i%2?-scale:scale} ${scale})"><g class="fish-drift" style="--delay:-${i*2.3}s;--duration:${11+i%5*2}s;filter:hue-rotate(${t.traits.appearance*14}deg)">${animalArt(t.species,a.color)}</g></g>`;}svg.insertBefore(group(fish),anchor);}
  let fry='';for(let i=0;i<Math.min(12,view.fry);i++)fry+=`<use href="#paint-fry" transform="translate(${t.equipment.nursery?582+(i*19)%64:280+(i*37)%260} ${t.equipment.nursery?214+(i%3)*12:325+(i%4)*11}) scale(.7)"/>`;svg.insertBefore(group(fry),anchor);
  let companions='';t.companions.forEach((id,i)=>{companions+=`<g transform="translate(${340+i*60} 400) scale(.7)">${animalArt(id,ANIMALS[id].color)}</g>`;});svg.insertBefore(group(companions),anchor);
  if(s.unlocks.controller)svg.insertBefore(group('<rect x="133" y="473" width="66" height="26" rx="4" fill="#6a7f6e"/><rect x="141" y="479" width="33" height="13" rx="2" fill="#294a41"/><path d="M146 486H152L156 482 160 489 167 484" stroke="#c6d198" fill="none"/><circle cx="186" cy="486" r="3" fill="#b4c794"/>'),anchor);
  if(t.ready>0){const note=group('<text x="402" y="294" text-anchor="middle" fill="#e2d8b6" font-family="Georgia,serif" font-size="19" font-style="italic">Good things take a little time.</text>');svg.insertBefore(note,anchor);}
  mount.replaceChildren(svg);
}
