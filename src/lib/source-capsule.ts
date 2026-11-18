import type {ConversationThread} from '../types';
export function sourceCapsule(thread:ConversationThread){
 if(thread.messages.length!==1)return null;
 try{const value=JSON.parse(thread.messages[0].content.replace(/^\uFEFF/,''));if(value?.schema!=='chatgrab.governed-continuity-capsule.v1')return null;
 return {value: value as Record<string,unknown>,events:Array.isArray(value.conversation_history_reconstruction)?value.conversation_history_reconstruction:[],excerpt:typeof value.verbatim_source_excerpt?.text==='string'?value.verbatim_source_excerpt.text:'',fields:Object.keys(value)};
 }catch{return null;}
}
