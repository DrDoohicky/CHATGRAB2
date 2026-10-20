"""Render the exact website panels as an ink/paper animated GIF, without raster inputs."""
from pathlib import Path
import json
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
slides=json.loads((ROOT/'src/hero-slides.json').read_text(encoding='utf-8-sig'))
W,H=960,540
PAPER=(241,243,245);INK=(32,33,39);BLUE=(37,76,163);RED=(189,59,55);PLUM=(104,69,94)
base=Image.new('RGB',(W,H),PAPER);d=ImageDraw.Draw(base)
d.line((64,426,896,426),fill=INK,width=1)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',17)
d.text((64,450),'VALIDATE. REINTEGRATE. TRANSFORM.',font=small,fill=PLUM)
palette=[]
for end in [INK,BLUE,RED,PLUM]:
    for i in range(64):palette.extend(round(a+(b-a)*i/63) for a,b in zip(PAPER,end))
pal=Image.new('P',(1,1));pal.putpalette(palette)
frames=[];durations=[];poster=None
def add_frame(image,duration):
    frames.append(image.quantize(palette=pal,dither=Image.Dither.NONE));durations.append(duration)
for idx,slide in enumerate(slides):
    complete=base.copy();draw=ImageDraw.Draw(complete);lines=slide['lines'];size=76 if len(lines)==1 else 60
    font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',size)
    while max(draw.textlength(line,font=font) for line in lines)>W-128:
        size-=1;font=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',size)
    top=75;line_height=size+14
    for n,line in enumerate(lines):
        color=INK if n==0 else BLUE
        if slide['id']=='brand':
            prefix="It's Chat";draw.text((64,top),prefix,font=font,fill=INK)
            x=64+draw.textlength(prefix,font=font);draw.text((x,top),'Grab.',font=font,fill=RED)
        else:draw.text((64,top+n*line_height),line,font=font,fill=color)
    for n in range(len(slides)):
        x=790+n*17;draw.rectangle((x,459,x+5,464),fill=RED if n==idx else (174,177,184))
    if slide['id']=='catalog':poster=complete.copy()
    for step in range(1,8):
        amount=step/7;amount=amount*amount*(3-2*amount);add_frame(Image.blend(base,complete,amount),80)
    add_frame(complete,slide['duration']-1360)
    for step in range(1,8):
        amount=1-step/7;amount=amount*amount*(3-2*amount);add_frame(Image.blend(base,complete,amount),80)
    add_frame(base,240)
out=ROOT/'public/images/chatgrab-intro.gif'
frames[0].save(out,save_all=True,append_images=frames[1:],duration=durations,loop=0,optimize=True,disposal=1)
poster.save(ROOT/'public/images/chatgrab-intro-poster.png')
with Image.open(out) as gif:print(f'{gif.n_frames} frames, {out.stat().st_size/1024:.0f} KB')
