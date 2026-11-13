#!/usr/bin/env python3
"""Sanitize synthetic-only Playwright traces before sharing. Never accepts real user material."""
import argparse,json,os,re,zipfile
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('source');p.add_argument('destination');a=p.parse_args()
sensitive={'authorization','proxy-authorization','cookie','set-cookie','x-vercel-trusted-oidc-idp-token','x-vercel-protection-bypass','x-vercel-oidc-token'}
secret=os.environ.get('VERCEL_OIDC_TOKEN','');stats={'headerValuesRedacted':0,'exactTokenOccurrencesRedacted':0,'jwtPatternsRedacted':0,'jsonRecords':0,'cookieContainersRedacted':0,'filmstripFramesOmitted':0}
def clean(obj):
 if isinstance(obj,list):return [clean(x) for x in obj]
 if isinstance(obj,dict):
  if str(obj.get('name','')).lower() in sensitive and 'value' in obj:
   obj={**obj,'value':'[REDACTED]'};stats['headerValuesRedacted']+=1
  result={}
  for k,v in obj.items():
   if k.lower()=='cookies':result[k]=[];stats['cookieContainersRedacted']+=1
   elif k.lower() in sensitive:result[k]='[REDACTED]'
   else:result[k]=clean(v)
  return result
 if isinstance(obj,str):
  if secret and secret in obj:stats['exactTokenOccurrencesRedacted']+=obj.count(secret);obj=obj.replace(secret,'[REDACTED]')
  obj=re.sub(r'([?&](?:_vercel_share|x-vercel-protection-bypass|session_id|client_secret|access_token|code|state)=)[^&#\s"]+',r'\1[REDACTED]',obj,flags=re.I)
  obj,n=re.subn(r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+','[REDACTED-JWT]',obj);stats['jwtPatternsRedacted']+=n
  return obj
 return obj
Path(a.destination).parent.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(a.source) as z,zipfile.ZipFile(a.destination,'w',compression=zipfile.ZIP_DEFLATED) as out:
 omitted=set()
 for name in z.namelist():
  if name.endswith('.trace'):
   for line in z.read(name).decode().splitlines():
    try:
     record=json.loads(line)
     if record.get('type')=='screencast-frame' and record.get('sha1'):omitted.add('resources/'+record['sha1'])
    except json.JSONDecodeError:pass
 for item in z.infolist():
  if item.filename in omitted:continue
  data=z.read(item.filename)
  if item.filename.endswith(('.trace','.network','.stacks','.json')):
   text=data.decode('utf-8');lines=[]
   for line in text.splitlines():
    if not line.strip():continue
    try:
     record=json.loads(line)
     if record.get('type')=='screencast-frame':stats['filmstripFramesOmitted']+=1;continue
     lines.append(json.dumps(clean(record),separators=(',',':')));stats['jsonRecords']+=1
    except json.JSONDecodeError:lines.append(clean(line))
   data=('\n'.join(lines)+'\n').encode()
  elif secret and secret.encode() in data:
   data=data.replace(secret.encode(),b'[REDACTED]');stats['exactTokenOccurrencesRedacted']+=1
  assert not secret or secret.encode() not in data,'Token remains in sanitized entry'
  out.writestr(item.filename,data)
with zipfile.ZipFile(a.destination) as z:
 for name in z.namelist():
  data=z.read(name)
  assert not secret or secret.encode() not in data
  if name.endswith(('.trace','.network','.json')):
   for line in data.decode().splitlines():
    def verify(x):
     if isinstance(x,dict):
      if str(x.get('name','')).lower() in sensitive and 'value' in x:assert x['value']=='[REDACTED]'
      for k,v in x.items():
       if k.lower() in sensitive:assert v=='[REDACTED]'
       else:verify(v)
     elif isinstance(x,list):
      for v in x:verify(v)
    try:verify(json.loads(line))
    except json.JSONDecodeError:pass
Path(a.destination+'.redaction.json').write_text(json.dumps({'status':'PASS','syntheticOnly':True,'credentialsIncluded':False,**stats},indent=2)+'\n')
print(json.dumps({'status':'PASS','sanitizedTrace':Path(a.destination).name,**stats}))
