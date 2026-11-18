export function messageAnchor(threadId:string,messageId:string){return 'cg-message-'+threadId.length+'-'+encodeURIComponent(threadId)+'-'+encodeURIComponent(messageId);}
export function literalParts(text:string,query:string):{text:string;match:boolean}[]{
 if(!query)return [{text,match:false}];const out:{text:string;match:boolean}[]=[];let at=0;const hay=text.toLocaleLowerCase(),needle=query.toLocaleLowerCase();let hit=hay.indexOf(needle);
 while(hit!==-1){if(hit>at)out.push({text:text.slice(at,hit),match:false});out.push({text:text.slice(hit,hit+query.length),match:true});at=hit+query.length;hit=hay.indexOf(needle,at);}if(at<text.length)out.push({text:text.slice(at),match:false});return out;
}
export function wrappedHit(current:number,delta:number,count:number){return count?((current+delta)%count+count)%count:0;}
