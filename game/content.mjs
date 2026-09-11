// Prices are integer cents; durations are productive seconds. Aquarium units are fictional.
export const VERSION = 1;
export const OFFLINE_CAP = 86400;
export const PHASES = [
  ['The windowsill', 'Make one small ecosystem productive.'],
  ['A local breeder', 'Give the next generation room to grow.'],
  ['Living production', 'Let plants, cultures and nurseries support each other.'],
  ['Made to thrive', 'Turn familiar ingredients into complete aquarium setups.'],
  ['A room full of fish', 'Coordinate the room and develop your own strains.'],
  ['Your independent fish room', 'Build a room that can keep its promises.'],
];
export const PLANTS = {
  hornwort:{name:'Hornwort',phase:1,rate:.10,price:300,seed:1500,cover:1,export:1,color:'#83ad84',kind:'grass',note:'Fast stems. A dependable first crop and nutrient export.'},
  moss:{name:'Java moss',phase:2,rate:.07,price:500,seed:2400,cover:1.3,export:.9,color:'#8daf66',kind:'moss',note:'Dense cover raises prospective fry yield by 30%.'},
  fern:{name:'Java fern',phase:3,rate:.045,price:850,seed:3800,cover:1,export:.8,color:'#9bae76',kind:'fern',note:'Slow rhizomes for low-tech planted setups.'},
  anubias:{name:'Anubias',phase:3,rate:.035,price:1100,seed:4900,cover:1,export:.7,color:'#628b59',kind:'fern',note:'Compact premium plants; low light is sufficient.'},
  frogbit:{name:'Frogbit',phase:3,rate:.12,price:300,seed:1500,cover:1.1,export:1.5,color:'#b1bd76',kind:'floating',note:'Strong export and surface cover; lower sale value.'},
  vallisneria:{name:'Vallisneria',phase:3,rate:.08,price:550,seed:2600,cover:1,export:1.1,color:'#7caa79',kind:'grass',note:'Runner production is 25% faster in long tanks.'},
  sword:{name:'Amazon sword',phase:4,rate:.035,price:1400,seed:6200,cover:1,export:1.2,color:'#7f9e5b',kind:'fern',note:'Large focal plants for community setups.'},
  crypt:{name:'Cryptocoryne',phase:4,rate:.05,price:950,seed:4300,cover:1.1,export:1,color:'#aa8c69',kind:'fern',note:'Settles for two minutes after planting, then grows steadily.'},
  rotala:{name:'Rotala',phase:4,rate:.11,price:800,seed:3700,cover:1,export:1,color:'#bd9475',kind:'grass',note:'Needs a planted LED for its full growth rate.'},
  pothos:{name:'Pothos roots',phase:5,rate:.065,price:1000,seed:4600,cover:1,export:1.8,color:'#8caa68',kind:'emergent',note:'Leaves above water; exceptional root-zone nutrient export.'},
};
export const ANIMALS = {
  guppy:{name:'Guppies',phase:1,group:4,batch:4,pulse:240,mature:240,load:1,price:300,cost:1200,color:'#e58c72',shape:'guppy',need:null,note:'Fast livebearers. Protect a group and sell the grown offspring.'},
  shrimp:{name:'Cherry shrimp',phase:2,group:4,batch:4,pulse:300,mature:300,load:.5,price:650,cost:3000,color:'#d67262',shape:'shrimp',need:'plants',note:'Planted colonies. At least 4 retained plant biomass supports breeding.'},
  snail:{name:'Ramshorn snails',phase:2,group:2,batch:4,pulse:180,mature:240,load:.5,price:180,cost:600,color:'#b9976e',shape:'snail',need:null,note:'Low-cost cleanup packs. They still occupy real capacity.'},
  danio:{name:'Zebra danios',phase:3,group:6,batch:6,pulse:300,mature:360,load:1,price:550,cost:4000,color:'#b5c6bd',shape:'stripe',need:'nursery',note:'Egg scatterers. A nursery partition protects their future cohort.'},
  cory:{name:'Bronze corydoras',phase:3,group:6,batch:4,pulse:420,mature:420,load:1.5,price:1100,cost:7800,color:'#a9ab84',shape:'bottom',need:'long',note:'Bottom dwellers that breed in long tanks or breeder footprints.'},
  pleco:{name:'Bristlenose plecos',phase:4,group:2,batch:3,pulse:480,mature:540,load:3,price:2000,cost:6000,color:'#889078',shape:'bottom',need:'cave',note:'Cave spawners with high bioload and valuable small broods.'},
  gourami:{name:'Honey gouramis',phase:4,group:2,batch:4,pulse:420,mature:420,load:1.5,price:1400,cost:4200,color:'#d8b564',shape:'round',need:'calm',note:'Bubble nest builders. A flow baffle creates calm water.'},
  rasbora:{name:'Harlequin rasboras',phase:4,group:6,batch:4,pulse:420,mature:480,load:1,price:1200,cost:9000,color:'#d5a485',shape:'stripe',need:'plants',note:'A planted group supplies peaceful community setups.'},
  killifish:{name:'Killifish',phase:5,group:2,batch:4,pulse:480,mature:600,load:1,price:2200,cost:6000,color:'#bca275',shape:'stripe',need:'nursery',note:'Long egg development rewards spare nursery space.'},
  rainbow:{name:'Rainbowfish',phase:5,group:6,batch:5,pulse:540,mature:600,load:2,price:2500,cost:18000,color:'#8bb2b3',shape:'round',need:'large',note:'Open-water groups require a breeder or display aquarium.'},
  amano:{name:'Amano shrimp',phase:3,utility:true,cost:1800,price:1200,load:1,color:'#a6b6a0',shape:'shrimp',note:'One companion per tank; +10% plant growth. No freshwater breeding income.'},
  nerite:{name:'Nerite snail',phase:3,utility:true,cost:1500,price:1000,load:1,color:'#b59c6b',shape:'snail',note:'One companion per tank; +15% nutrient export. No breeding income.'},
};
export const FOOTPRINTS = {
  starter:{name:'10-gallon starter',short:'10 gal',phase:1,cost:3200,space:1,capacity:12,plants:20,tags:[]},
  long:{name:'20-gallon long',short:'20 long',phase:2,cost:6500,space:2,capacity:24,plants:32,tags:['long']},
  tall:{name:'29-gallon tall',short:'29 tall',phase:3,cost:8000,space:2,capacity:28,plants:30,tags:['emergent']},
  breeder:{name:'40-gallon breeder',short:'40 breeder',phase:3,cost:12000,space:3,capacity:40,plants:40,tags:['long','large']},
  display:{name:'75-gallon display',short:'75 gal',phase:4,cost:23000,space:5,capacity:68,plants:64,tags:['long','large']},
  rack:{name:'Breeding rack cell',short:'Rack cell',phase:3,cost:5000,space:1,capacity:18,plants:16,tags:['long']},
};
export const EQUIPMENT = {
  sponge:{name:'Fry-safe filtration',phase:1,costs:[800,3500,9000],names:['Sponge filter','Double sponge','Mature media tower'],note:'Biological capacity 4 → 16 → 36 → 76 load; physical tank space still applies.',art:'sponge'},
  light:{name:'Planted lighting',phase:1,costs:[2000,6000],names:['Planted LED','Twin planted LED'],note:'+30% plant growth per tier, when nutrients and space allow.',art:'lighting'},
  nursery:{name:'Nursery protection',phase:2,costs:[1800,5000],names:['Mesh nursery','Partitioned grow-out'],note:'+25% prospective brood yield per tier; full adult load is reserved at birth.',art:'nursery'},
  feeder:{name:'Feeding system',phase:2,costs:[2400,6200],names:['Scheduled feeder','Precision fry feeder'],note:'Breeding cycles are 10% faster per tier. Baseline feeding is always included.',art:'feeder'},
  exchange:{name:'Water exchange',phase:2,costs:[2500,7000],names:['Drip exchange','Closed service loop'],note:'Raises nutrient export and gives high-output tanks more headroom.',art:'automation'},
  sensor:{name:'Water sensor',phase:2,costs:[1800],names:['Rim-mounted probe'],note:'A monitoring probe adds a 10% production safety margin. Readings are always free.',art:'sensor'},
  substrate:{name:'Planted substrate',phase:3,costs:[3000,8500],names:['Rooted bed','Deep planted bed'],note:'+6 plant capacity and +10% plant growth per tier.',art:'plants'},
  cave:{name:'Spawning cave',phase:3,costs:[2000],names:['Terracotta breeding cave'],note:'Creates a cave-spawning habitat for bristlenose plecos.',art:'cave'},
  calm:{name:'Flow baffle',phase:3,costs:[1800],names:['Gentle-flow baffle'],note:'Creates the calm surface needed by honey gouramis.',art:'calm'},
  roots:{name:'Emergent planter',phase:4,costs:[4000,9000],names:['Riparium basket','Root-wall planter'],note:'+35% nutrient export per tier. Leaves remain above the water.',art:'roots'},
  heater:{name:'Heater control',phase:1,costs:[1600],names:['Smart thermostat'],note:'Stable production raises prospective brood yield by 10%; basic heat is included.',art:'heater'},
};
export const GLOBALS = {
  dispatcher:{name:'Surplus dispatcher',phase:1,cost:1000,note:'Unlocks automatic trimming and juvenile sales with protected reserves.'},
  rack:{name:'The spare shelf',phase:2,cost:8000,note:'Unlock the first rack expansion. Room space rises from 4 to 10.'},
  circuit:{name:'Dedicated circuit',phase:2,cost:6000,note:'Power budget rises from 8 to 24 units.'},
  workshop:{name:'Setup workshop',phase:3,cost:12000,note:'Open an assembly bay and sell complete planted aquariums.'},
  logistics:{name:'Packing bench',phase:4,cost:15000,note:'Two assembly bays and six simultaneous dispatch jobs.'},
  controller:{name:'Fish room controller',phase:4,cost:45000,note:'Room templates, automatic media production and repeat contracts.'},
  room:{name:'The dedicated fish room',phase:5,cost:60000,note:'Space rises to 36 and power to 60. Your windowsill has officially lost.'},
};
export const CULTURES = {
  greenwater:{name:'Green water',cost:2500,duration:120,yield:4,input:'nutrients',need:2,note:'Turns captured nutrients into a living culture.'},
  daphnia:{name:'Daphnia',cost:4000,duration:180,yield:4,input:'greenwater',need:2,note:'Converts green water into an intensive live food.'},
  infusoria:{name:'Infusoria',cost:3000,duration:150,yield:4,input:'hornwort',need:500,note:'A little plant matter supports tiny fry food.'},
  microworms:{name:'Microworms',cost:3500,duration:150,yield:4,input:'feed',need:1,note:'An independent live-food route from culture feed.'},
};
export const CONTRACTS = {
  guppy:{name:'The fish store needs guppies',phase:2,fish:{guppy:8},plants:{},price:3400,duration:120,note:'Eight healthy, home-grown juveniles.'},
  plants:{name:'Beginner plant bundles',phase:2,fish:{},plants:{hornwort:6000},price:2600,duration:120,note:'Six biomass of easy-growing stems.'},
  shrimp:{name:'A planted-tank regular',phase:2,fish:{shrimp:6},plants:{moss:2000},price:6500,duration:180,note:'A little colony and a soft place to graze.'},
  fern:{name:'Low-tech plant collection',phase:3,fish:{},plants:{fern:4000,anubias:2000},price:7800,duration:180,note:'Slow-growing plants for patient people.'},
  danio:{name:'School supply',phase:3,fish:{danio:12},plants:{},price:9000,duration:180,note:'A lively group for the local shop.'},
  specialist:{name:'The bottom-dweller club',phase:4,fish:{cory:6},plants:{vallisneria:3000},price:11000,duration:240,note:'A group of corydoras and room to explore.'},
};
export const RECIPES = {
  guppy:{name:'Beginner guppy setup',phase:4,fish:{guppy:4},plants:{hornwort:4000},media:1,parts:2600,price:10800,duration:360,footprint:'starter',note:'Actually Responsible First Aquarium.'},
  planted:{name:'Low-tech planted nano',phase:4,fish:{},plants:{fern:6000,hornwort:4000},media:1,parts:3200,price:16500,duration:480,footprint:'starter',note:'A peaceful piece of green. Stocking plan included.'},
  shrimp:{name:'Shrimp cube',phase:4,fish:{shrimp:4},plants:{moss:4000,hornwort:4000},media:1,parts:2800,price:15500,duration:600,footprint:'starter',note:'A very small neighborhood, with very small residents.'},
  community:{name:'Peaceful long community',phase:4,fish:{rasbora:6},plants:{hornwort:4000,sword:1000},media:1,parts:5500,price:24000,duration:720,footprint:'long',note:'A complete school and a properly planted home.'},
  breeder:{name:'Specialty breeding package',phase:5,fish:{danio:6},plants:{moss:4000},media:1,food:{infusoria:2},grade:1,parts:5000,price:26500,duration:600,footprint:'rack',note:'A selected danio line, fry cover and its first live food.'},
  riparium:{name:'Plant-production riparium',phase:5,fish:{},plants:{hornwort:6000,pothos:4000},media:2,parts:6500,price:30000,duration:900,footprint:'tall',note:'The leaves are above the water. The work happens below.'},
};
export const SPACE = s => s.unlocks.room ? 36 : s.unlocks.rack ? 10 : 4;
export const POWER = s => s.unlocks.room ? 60 : s.unlocks.circuit ? 24 : 8;
export const emptyMap = keys => Object.fromEntries(Object.keys(keys).map(k=>[k,0]));
