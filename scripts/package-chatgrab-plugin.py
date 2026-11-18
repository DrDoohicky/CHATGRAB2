"""Package the private client-side plugin setup, never credentials or user data."""
from pathlib import Path
import hashlib,json,subprocess,zipfile
root=Path(__file__).resolve().parent.parent
plugin=root/'plugins/chatgrab';out=root/'docs/packages/ChatGrab-Private-Plugin.zip';out.parent.mkdir(parents=True,exist_ok=True)
files=[p for p in plugin.rglob('*') if p.is_file()]
entries={'ChatGrab-Private-Plugin/'+p.relative_to(root).as_posix():p.read_bytes() for p in files}
entries['ChatGrab-Private-Plugin/.agents/plugins/marketplace.json']=(plugin/'marketplace.example.json').read_bytes()
entries['ChatGrab-Private-Plugin/START-HERE.md']=b'''# ChatGrab private connection\n\nIn ChatGPT Plugins, add a custom MCP server named ChatGrab.\nURL: https://chatgrab.app/api/mcp\nAuthentication: None\nReview the tools and choose Create as a plugin.\n\nThen select ChatGrab in a new chat and ask:\nUse ChatGrab to check its connection status, then give me its workspace link.\n\nThis archive does not install itself or provide native conversation capture.\nThe endpoint already serves public read-only status and workspace links.\nNo OpenAI API key or payment is needed for these tools. Host policies apply.\nSee plugins/chatgrab/README.md for the full host acceptance steps.\nThe local marketplace is an optional desktop authoring route, separate from\nthe direct custom-MCP connection. Do not publish the plugin publicly.\n'''
manifest={'sourceCommit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip(),'purpose':'Private ChatGrab host connection package; host installation/invocation not verified','files':{k:hashlib.sha256(v).hexdigest() for k,v in entries.items()}}
entries['ChatGrab-Private-Plugin/PACKAGE-MANIFEST.json']=json.dumps(manifest,indent=2).encode()
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for name,data in entries.items():z.writestr(name,data)
with zipfile.ZipFile(out) as z:assert z.testzip() is None
sha=hashlib.sha256(out.read_bytes()).hexdigest();out.with_suffix('.zip.sha256').write_text(sha+'  '+out.name+'\n');print(json.dumps({'path':str(out),'bytes':out.stat().st_size,'sha256':sha}))
