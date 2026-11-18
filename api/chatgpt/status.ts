import {chatgptConnection} from '../../lib/chatgpt-connection.js';
export default function handler(req:any,res:any){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='GET')return res.status(405).json({success:false,error:'Use GET to inspect the ChatGPT connection.'});
 return res.status(200).json(chatgptConnection);
}
