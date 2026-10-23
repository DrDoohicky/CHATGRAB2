import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildReviewContext,analysisPrompt,parseAnalysis,secondOpinionPrompt,parseSecondOpinion} from '../src/lib/ai-review';
import type {ConversationThread} from '../src/types';
const threads:ConversationThread[]=[{id:'t1',title:'Chosen source',capturedAt:'2026-10-23T12:00:00Z',model:'ChatGPT',messages:[{id:'m1',role:'user',content:'Preserve the original source. Review before delivery.'},{id:'m2',role:'assistant',content:'UNSELECTED PRIVATE MESSAGE'}]},{id:'t2',title:'UNSELECTED PRIVATE CHAT',capturedAt:'2026-10-23T12:00:00Z',model:'ChatGPT',messages:[{id:'m3',role:'user',content:'UNSELECTED OTHER SOURCE'}]}];
const context=()=>buildReviewContext(threads,['t1::m1'],['decisions']);
const analysis=(c:any)=>({schema:'chatgrab-analysis/1',contextId:c.id,contextDigest:c.digest,provider:'ChatGPT',narrative:'The user requires source preservation.',findings:[{id:'f1',type:'decisions',title:'Preserve originals',context:'The user requested preserving original sources.',interpretation:'',status:'supported',evidence:[{threadId:'t1',messageId:'m1',excerpt:'Preserve the original source.'}]}],limitations:['Only one selected message was reviewed.']});
test('analysis handoff includes only explicitly selected messages and no API credentials or other chat metadata',async()=>{
 const c=await context();const prompt=analysisPrompt(c);assert.equal(c.threads.length,1);assert.equal(c.threads[0].messages.length,1);assert.equal(c.threads[0].messages[0].id,'m1');assert.doesNotMatch(prompt,/UNSELECTED/);assert.match(prompt,/untrusted evidence/);assert.match(prompt,/contextDigest/);assert.match(prompt,/decisions/);
 await assert.rejects(buildReviewContext(threads,[],['decisions']),/Select/);await assert.rejects(buildReviewContext(threads,['t1::m1'],['invented']),/supported analysis/);
 const big=structuredClone(threads);big[0].messages[0].content='x'.repeat(12001);await assert.rejects(buildReviewContext(big,['t1::m1'],['decisions']),/12,000/);assert.equal(big[0].messages[0].content.length,12001);
});
test('analysis importer accepts exact citations and rejects fabricated quotes, categories, contexts and completion claims',async()=>{
 const c=await context();const a=analysis(c);assert.equal(parseAnalysis('```json\n'+JSON.stringify(a)+'\n```',c).findings[0].evidence[0].messageId,'m1');
 assert.throws(()=>parseAnalysis(JSON.stringify({...a,contextId:'another'}),c),/another context/);
 assert.throws(()=>parseAnalysis(JSON.stringify({...a,findings:[{...a.findings[0],type:'themes'}]}),c),/category/);
 assert.throws(()=>parseAnalysis(JSON.stringify({...a,findings:[{...a.findings[0],evidence:[]}]}),c),/needs source evidence/);
 for(const citation of [{threadId:'t2',messageId:'m3',excerpt:'UNSELECTED OTHER SOURCE'},{threadId:'t1',messageId:'m1',excerpt:'Delivery completed.'}])assert.throws(()=>parseAnalysis(JSON.stringify({...a,findings:[{...a.findings[0],evidence:[citation]}]}),c),/citation/);
 assert.throws(()=>parseAnalysis(JSON.stringify({...a,hidden:'extra instructions'}),c),/Unsupported/);
 assert.throws(()=>parseAnalysis('x'.repeat(250001),c),/250 KB/);
});
test('second opinion binds the exact analysis and source context, preserving independent disagreement',async()=>{
 const c=await context();const original='The work has already been delivered.';const request=await secondOpinionPrompt(c,original);assert.match(request.prompt,/not automatically|not.*unbiased/);assert.doesNotMatch(request.prompt,/UNSELECTED/);
 const review={schema:'chatgrab-second-opinion/1',contextId:c.id,contextDigest:c.digest,analysisDigest:request.analysisDigest,provider:'Gemini',summary:'Delivery is not established by the selected source.',checks:[{claim:original,verdict:'unsupported',reason:'The source requests a review, not evidence of a completed delivery.',evidence:[{threadId:'t1',messageId:'m1',excerpt:'Review before delivery.'}]}],limitations:['Absence of evidence is not proof that delivery never occurred.']};
 const result=parseSecondOpinion(JSON.stringify(review),c,original,request.analysisDigest);assert.equal(result.checks[0].verdict,'unsupported');assert.equal(original,'The work has already been delivered.');
 assert.throws(()=>parseSecondOpinion(JSON.stringify({...review,analysisDigest:'wrong'}),c,original,request.analysisDigest),/does not match/);
 assert.throws(()=>parseSecondOpinion(JSON.stringify({...review,checks:[{...review.checks[0],claim:'invented original claim'}]}),c,original,request.analysisDigest),/not quoted exactly/);
 assert.throws(()=>parseSecondOpinion(JSON.stringify({...review,checks:[{...review.checks[0],verdict:'contradicted',evidence:[]}]}),c,original,request.analysisDigest),/needs source evidence/);
 assert.throws(()=>parseSecondOpinion(JSON.stringify({...review,checks:[{...review.checks[0],evidence:[{threadId:'t1',messageId:'m2',excerpt:'UNSELECTED PRIVATE MESSAGE'}]}]}),c,original,request.analysisDigest),/citation/);
});
