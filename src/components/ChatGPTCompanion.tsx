import React from 'react';
import type {ConversationThread} from '../types';
import {ChatGPTConnectionPanel} from './ChatGPTConnectionPanel';
export function ChatGPTCompanion({isOpen,onClose}:{isOpen:boolean;onClose:()=>void;activeThread:ConversationThread|null}){
 return isOpen?<ChatGPTConnectionPanel onClose={onClose}/>:null;
}
