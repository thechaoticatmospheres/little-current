import {advance} from './engine.mjs';
self.onmessage=({data})=>{try{self.postMessage({ok:true,state:advance(data.state,data.seconds)});}catch(error){self.postMessage({ok:false,error:error.message});}};
