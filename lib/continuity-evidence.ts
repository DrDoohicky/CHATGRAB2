type Evidence={threadId:string;messageId:string;excerpt:string};
export function validateContinuityFindings(findings:unknown[], analyses:string[], sources:Map<string,Map<string,string>>){
 let repairedQuotes=0;
 const clean=findings.filter((finding:any)=>finding&&typeof finding.title==='string'&&analyses.includes(String(finding.type))).map((finding:any)=>{
  const evidence:Evidence[]=(Array.isArray(finding.evidence)?finding.evidence:[]).flatMap((item:any)=>{
   if(!item||typeof item.threadId!=='string'||typeof item.messageId!=='string')return [];
   const source=sources.get(item.threadId)?.get(item.messageId);if(source===undefined)return [];
   const quote=typeof item.excerpt==='string'?item.excerpt:'';
   const exact=quote.trim()&&source.includes(quote);
   if(!exact)repairedQuotes++;
   return [{threadId:item.threadId,messageId:item.messageId,excerpt:exact?quote:source.slice(0,400)}];
  });
  return {type:String(finding.type),title:finding.title,context:String(finding.context||''),interpretation:String(finding.interpretation||''),status:evidence.length&&['supported','uncertain','unresolved'].includes(finding.status)?finding.status:'unresolved',evidence};
 });
 return {findings:clean,repairedQuotes};
}
