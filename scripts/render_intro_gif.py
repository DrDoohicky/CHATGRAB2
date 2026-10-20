"""Render the exact website headline panels as an animated, looping GIF.
Creates typography from source data; no source photographs or user captures are modified.
"""
from pathlib import Path
import json, math
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
slides=json.loads((ROOT/'src/hero-slides.json').read_text(encoding='utf-8-sig'))
W,H=960,540
font_path='C:/Windows/Fonts/segoeuib.ttf'
font_regular='C:/Windows/Fonts/segoeui.ttf'
base=Image.new('RGB',(W,H))
pixels=base.load()
for y in range(H):
    for x in range(W):
        glow=max(0,1-math.hypot((x-760)/900,(y-230)/420))
        pixels[x,y]=(int(2+3*glow),int(17+17*glow),int(39+30*glow))
d=ImageDraw.Draw(base)
d.arc((400,20,1150,470),165,315,fill=(26,92,133),width=1)
d.arc((250,80,1100,600),190,295,fill=(19,65,105),width=1)
for x,y,r in [(800,82,2),(868,185,3),(725,419,2),(529,78,1),(110,404,1),(370,449,1)]:
    d.ellipse((x-r*3,y-r*3,x+r*3,y+r*3),fill=(12,53,88))
    d.ellipse((x-r,y-r,x+r,y+r),fill=(131,218,255))
brand=ImageFont.truetype(font_path,32)
d.text((64,40),'Chat',font=brand,fill=(241,249,255))
chat_width=d.textlength('Chat',font=brand)
d.text((64+chat_width,40),'Grab',font=brand,fill=(86,208,255))
small=ImageFont.truetype(font_regular,17)
d.text((64,465),'Validate. Reintegrate. Transform.',font=small,fill=(145,192,222))
# Shared palette: dark blue background plus smooth white/cyan fades.
palette=[]
for start,end in [((2,17,39),(12,56,95)),((4,24,50),(246,250,255)),((4,24,50),(86,208,255)),((4,24,50),(140,115,240))]:
    for i in range(64):palette.extend(round(a+(b-a)*i/63) for a,b in zip(start,end))
pal=Image.new('P',(1,1));pal.putpalette(palette)
frames=[];durations=[]
def add_frame(image,duration):
    frames.append(image.quantize(palette=pal,dither=Image.Dither.NONE));durations.append(duration)
for idx,slide in enumerate(slides):
    complete=base.copy();draw=ImageDraw.Draw(complete)
    lines=slide['lines'];size=68 if len(lines)==1 else 55
    font=ImageFont.truetype(font_path,size)
    while max(draw.textlength(line,font=font) for line in lines)>W-128:
        size-=1;font=ImageFont.truetype(font_path,size)
    line_height=size+10
    top=245-len(lines)*line_height/2
    for line_index,line in enumerate(lines):
        color=(246,250,255) if line_index==0 else (86,208,255)
        if slide['id']=='brand':
            pre="It's "; chat='Chat'; grab='Grab.'
            draw.text((64,top),pre,font=font,fill=color)
            x=64+draw.textlength(pre,font=font)
            draw.text((x,top),chat,font=font,fill=color);x+=draw.textlength(chat,font=font)
            draw.text((x,top),grab,font=font,fill=(86,208,255))
        else:draw.text((64,top+line_index*line_height),line,font=font,fill=color)
    for n in range(len(slides)):
        x=789+n*17
        draw.ellipse((x,475,x+5,480),fill=(92,214,255) if n==idx else (53,91,125))
    for step in range(1,8):
        amount=step/7;amount=amount*amount*(3-2*amount)
        add_frame(Image.blend(base,complete,amount),80)
    add_frame(complete,slide['duration']-1360)
    for step in range(1,8):
        amount=1-step/7;amount=amount*amount*(3-2*amount)
        add_frame(Image.blend(base,complete,amount),80)
    add_frame(base,240)
out=ROOT/'public/images/chatgrab-intro.gif'
frames[0].save(out,save_all=True,append_images=frames[1:],duration=durations,loop=0,optimize=True,disposal=1)
with Image.open(out) as gif:
    total=0
    for i in range(gif.n_frames):gif.seek(i);total+=gif.info.get('duration',0)
    print(f'{out.name}: {gif.n_frames} frames, {total/1000:.1f}s, {out.stat().st_size/1024:.0f} KB')
# Static title panel for the download's poster and non-animated previews.
poster=base.copy();draw=ImageDraw.Draw(poster);font=ImageFont.truetype(font_path,55)
for n,line in enumerate(slides[3]['lines']):draw.text((64,135+n*65),line,font=font,fill=(246,250,255) if n==0 else (86,208,255))
poster.save(ROOT/'public/images/chatgrab-intro-poster.png')
