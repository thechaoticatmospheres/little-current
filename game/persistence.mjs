import {encodeSave,decodeSave} from './engine.mjs';
export const SAVE_KEY='little-current-campaign-v1';
const BACKUP=SAVE_KEY+'-backup', LEASE=SAVE_KEY+'-writer';
export class SaveStore {
  constructor(storage=localStorage){this.storage=storage;this.owner=crypto.randomUUID();this.error='';this.readOnly=false;this.timer=null;this.blockedSave=false;}
  load(now=Date.now()) {
    let raw;
    try{raw=this.storage.getItem(SAVE_KEY);}catch{this.error='Browser storage is unavailable. Export your room before closing.';return null;}
    if(!raw)return null;
    try{return decodeSave(raw,now,false);}catch{
      const backup=this.storage.getItem(BACKUP);
      if(backup){try{const restored=decodeSave(backup,now,false);this.error='Recovered the last valid backup. The unreadable save is preserved until you choose Save recovered room.';this.blockedSave=true;return restored;}catch{}}
      this.error='This browser save cannot be read. It has been preserved. Import a valid campaign or start a new room explicitly.';this.blockedSave=true;return null;
    }
  }
  claim(force=false){try{const old=JSON.parse(this.storage.getItem(LEASE)||'null');if(!force&&old&&old.owner!==this.owner&&Date.now()-old.at<12000){this.readOnly=true;return false;}this.storage.setItem(LEASE,JSON.stringify({owner:this.owner,at:Date.now()}));this.readOnly=false;return true;}catch{this.error='Storage is unavailable. Export saves are still available.';this.readOnly=false;return true;}}
  owns(){try{const lease=JSON.parse(this.storage.getItem(LEASE)||'null');return !lease||lease.owner===this.owner;}catch{return true;}}
  heartbeat(onLost){this.timer=setInterval(()=>{if(this.readOnly)return;if(!this.owns()){this.readOnly=true;onLost?.();return;}this.claim();},4000);}
  save(state,now=Date.now(),explicit=false){if(this.readOnly||!this.owns()){this.readOnly=true;return false;}if(this.blockedSave&&!explicit)return false;try{const raw=encodeSave(state,now);const previous=this.storage.getItem(SAVE_KEY);if(previous){try{decodeSave(previous,now,false);this.storage.setItem(BACKUP,previous);}catch{}}this.storage.setItem(SAVE_KEY,raw);this.blockedSave=false;this.error='';return true;}catch(error){this.error=`Could not save: ${error.message} Export your room to keep it.`;return false;}}
  release(){clearInterval(this.timer);try{if(this.owns())this.storage.removeItem(LEASE);}catch{}}
}
