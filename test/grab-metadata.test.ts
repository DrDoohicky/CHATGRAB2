import test from 'node:test';
import assert from 'node:assert/strict';
import {grabDateRange,grabTopicSummary} from '../src/lib/grab-metadata';
const thread={id:'t',title:'ChatGrab',capturedAt:'2026-10-26T10:00:00Z',model:'ChatGPT',messages:[{id:'m',role:'user' as const,content:'Update the ChatGrab logo and navigation, and publish it.'}]};
test('capture date is never fabricated into the chat range',()=>{assert.equal(grabDateRange(thread),'Chat dates unavailable');assert.match(grabDateRange({...thread,originalCreatedAt:'2025-01-01T00:00:00Z'}),/end unavailable/);});
test('range uses saved message dates, independent of capture time',()=>{const result=grabDateRange({...thread,messages:[{...thread.messages[0],timestamp:'2025-02-03T12:00:00Z'},{...thread.messages[0],id:'n',timestamp:'2025-01-01T12:00:00Z'}]});assert.match(result,/2025/);assert.doesNotMatch(result,/2026/);});
test('ChatGrab topic preview describes project subjects rather than its name alone',()=>{assert.match(grabTopicSummary(thread),/branding and interface design/);assert.match(grabTopicSummary(thread),/publishing and deployment/);assert.equal(grabTopicSummary({...thread,insights:{summary:'Existing reviewed summary'} as any}),'Existing reviewed summary');});
