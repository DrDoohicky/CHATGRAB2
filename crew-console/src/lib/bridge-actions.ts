import type {GovernedConsoleState} from '../types';
import {validateHandoff,type Handoff} from './crew-bridge';
import {validateState} from './validation';
export function attachBridgeHandoff(state:GovernedConsoleState,value:Handoff){
 const p=validateHandoff(value);const lane=state.lanes.find(l=>l.lane_id===p.assignment.laneId&&l.worker_id===p.assignment.workerId&&!l.archived&&l.status==='ACTIVE');
 if(!lane||!state.workers.some(w=>w.worker_id===lane.worker_id&&w.status==='ACTIVE'))throw Error('Destination worker/lane is unavailable.');
 const artifact_id='bridge-'+p.id;const reference='chatgrab:handoff/'+p.id;const existing=state.artifacts.find(a=>a.artifact_id===artifact_id);
 if(existing){if(existing.reference!==reference||existing.worker_id!==lane.worker_id||existing.lane_id!==lane.lane_id)throw Error('Handoff evidence ID conflicts with an existing artifact.');return state;}
 return validateState({...state,artifacts:[...state.artifacts,{artifact_id,worker_id:lane.worker_id,lane_id:lane.lane_id,type:'HANDOFF',title:p.assignment.title,reference,evidence_state:'PROPOSAL',created_at:new Date().toISOString()}]});
}
