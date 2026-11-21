import sys,glob
from PIL import Image
files=sys.argv[2:]; out=sys.argv[1]
ims=[Image.open(f).convert('RGB') for f in files]
w,h=ims[0].size; cols=2; rows=(len(ims)+1)//2
S=Image.new('RGB',(w*cols,h*rows))
for i,im in enumerate(ims): S.paste(im,((i%cols)*w,(i//cols)*h))
S.save(out,quality=85)
