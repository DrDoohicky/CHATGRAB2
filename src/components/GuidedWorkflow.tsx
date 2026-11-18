import React from 'react';
export function GuidedWorkflow({current,hasSource,onImport,onReview,onAnalyze,onExport}:{current:number;hasSource:boolean;onImport:()=>void;onReview:()=>void;onAnalyze:()=>void;onExport:()=>void}){
 const stages=[{label:'Import',action:onImport,enabled:true},{label:'Review',action:onReview,enabled:hasSource},{label:'Analyze',action:onAnalyze,enabled:hasSource},{label:'Export',action:onExport,enabled:hasSource}];
 return <nav className="cg-guided-workflow" aria-label="Source workflow">{stages.map((stage,i)=><button key={stage.label} type="button" aria-label={`Step ${i+1}: ${stage.label}`} aria-current={current===i?'step':undefined} disabled={!stage.enabled} onClick={stage.action}><span aria-hidden="true">{i+1}</span>{stage.label}</button>)}</nav>;
}
