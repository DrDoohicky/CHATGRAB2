from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
size=1024
im=Image.new('RGB',(size,size));p=im.load()
for y in range(size):
 for x in range(size):
  t=(x+y)/(2*size);p[x,y]=tuple(round(a+(b-a)*t) for a,b in zip((23,61,101),(12,37,69)))
d=ImageDraw.Draw(im)
d.ellipse((556,176,860,480),outline=(60,87,114),width=36)
d.line((708,152,708,110),fill=(60,87,114),width=36);d.line((884,328,926,328),fill=(60,87,114),width=36);d.line((828,206,858,176),fill=(60,87,114),width=36)
d.rounded_rectangle((264,310,786,704),radius=108,fill=(237,242,246))
d.polygon([(348,666),(318,810),(492,704)],fill=(237,242,246))
for x in (412,526,640):d.ellipse((x-34,508-34,x+34,508+34),fill=(22,132,94))
maskable=im.resize((512,512),Image.Resampling.LANCZOS);maskable.save(root/'public/images/chatgrab-icon-maskable-512.png')
alpha=Image.new('L',(size,size));ImageDraw.Draw(alpha).rounded_rectangle((0,0,size,size),radius=224,fill=255)
im.putalpha(alpha)
for target in (192,512):im.resize((target,target),Image.Resampling.LANCZOS).save(root/f'public/images/chatgrab-icon-{target}.png')
print('Android-size icons saved')
