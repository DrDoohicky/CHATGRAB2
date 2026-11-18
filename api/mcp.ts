import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {z} from 'zod';
export const workspaceUrl='https://chatgrab.app/';
export function createReadOnlyServer(){
 const server=new McpServer({name:'ChatGrab',version:'0.1.0'});
 const config={inputSchema:z.object({}).strict(),annotations:{readOnlyHint:true,destructiveHint:false,idempotentHint:true,openWorldHint:false},_meta:{securitySchemes:[{type:'noauth'}]}};
 server.registerTool('get_plugin_status',{...config,title:'ChatGrab connection status',description:'Read ChatGrab server health and supported capabilities. Does not read conversations, identify a ChatGPT user, run AI analysis or modify any data.'},async()=>{const data={schemaVersion:'chatgrab-plugin-status/1',product:'ChatGrab',serverHealth:'ok',authenticated:false,capabilities:{status:true,workspaceLink:true,privateLibrary:false,captureCurrentChat:false,historyAccess:false,automaticAnalysis:false,threadPanel:false,workerExecution:false,livePayments:false},message:'Read-only entrypoint. Open the workspace for user-controlled imports; no conversation context grant or account connection is established.'};return {content:[{type:'text' as const,text:JSON.stringify(data)}],structuredContent:data};});
 server.registerTool('get_workspace_link',{...config,title:'Open ChatGrab workspace',description:'Return the canonical ChatGrab workspace link and manual-import instructions. Does not open, scrape or capture the current conversation.'},async()=>{const data={url:workspaceUrl,importUrl:workspaceUrl+'?page=capture',requiresApiKey:false,instructions:'Open ChatGrab and use its user-controlled paste or compatible file import. Supply only material you want to preserve. Reviewed paste/file import and local review history are available in the published workspace. Existing private chats cannot be read by this tool.'};return {content:[{type:'text' as const,text:JSON.stringify(data)}],structuredContent:data};});
 return server;
}
export default async function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
 const origin=req.headers?.origin;
 if(origin&&!['https://chatgpt.com','https://chat.openai.com','http://127.0.0.1:3020','http://localhost:3020'].includes(origin))return res.status(403).json({error:'Origin not allowed.'});
 if(origin)res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');
 if(req.method==='OPTIONS'){res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');res.setHeader('Access-Control-Allow-Headers','Content-Type, Accept, MCP-Protocol-Version');return res.status(204).end();}
 if(req.method!=='POST'){res.setHeader('Allow','POST, OPTIONS');return res.status(405).json({jsonrpc:'2.0',id:null,error:{code:-32000,message:'Use streamable HTTP POST. This read-only server has no SSE subscription.'}});}
 if(Buffer.byteLength(JSON.stringify(req.body||{}))>32768)return res.status(413).json({error:'Request exceeds 32 KB.'});
 const server=createReadOnlyServer(),transport=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});
 res.on('close',()=>{void transport.close();void server.close();});
 try{await server.connect(transport);await transport.handleRequest(req,res,req.body);}catch{if(!res.headersSent)res.status(500).json({jsonrpc:'2.0',id:null,error:{code:-32603,message:'MCP request could not be processed.'}});}
}
