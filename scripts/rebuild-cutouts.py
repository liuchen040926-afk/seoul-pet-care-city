"""Optional build-time operation; website runtime does not depend on Python or model downloads.
Run with rembg[cpu], Pillow, NumPy and SciPy installed. Never generates a new animal.
Rebuilds transparent assets from the downloaded photographs, then updates provenance hashes.
"""
import pathlib,os,json,hashlib,csv
ROOT=pathlib.Path(__file__).resolve().parents[1]
os.environ.setdefault('U2NET_HOME',str(ROOT/'.image-models'))
os.environ.setdefault('OMP_NUM_THREADS','1')
from PIL import Image,ImageOps
import numpy as np
from scipy import ndimage
from rembg import new_session,remove
m=json.load(open(ROOT/'assets-manifest.json'));session=new_session('isnet-general-use',providers=['CPUExecutionProvider'])
for a in m['assets']:
 if a['category'] not in ['pets','branding']:continue
 image=ImageOps.exif_transpose(Image.open(ROOT/'references/photo-originals'/a['original_filename'])).convert('RGB');image.thumbnail((2000,2000),Image.Resampling.LANCZOS)
 cut=remove(image,session=session).convert('RGBA');alpha=np.asarray(cut.getchannel('A')).copy();labels,count=ndimage.label(alpha>60)
 if count:
  sizes=np.bincount(labels.ravel());sizes[0]=0;keep=ndimage.binary_dilation(labels==sizes.argmax(),iterations=5);alpha[~keep]=0
 alpha=np.clip((alpha.astype(float)-28)*255/(235-28),0,255).astype('uint8');alpha[alpha<15]=0;cut.putalpha(Image.fromarray(alpha));bbox=Image.fromarray((alpha>30).astype('uint8')*255).getbbox()
 if not bbox:raise ValueError('Empty foreground: '+a['file_name'])
 cut=cut.crop(bbox);factor=1500/max(cut.size);cut=cut.resize((round(cut.width*factor),round(cut.height*factor)),Image.Resampling.LANCZOS);canvas=Image.new('RGBA',(1600,1600));canvas.alpha_composite(cut,((1600-cut.width)//2,1600-cut.height));p=ROOT/'public'/a['file_name'];canvas.save(p,'WEBP',quality=92,method=6);a['sha256']=hashlib.sha256(p.read_bytes()).hexdigest();a['bytes']=p.stat().st_size
for p in ['assets-manifest.json','public/assets-manifest.json']:(ROOT/p).write_text(json.dumps(m,ensure_ascii=False,indent=2))
fields=['file_name','source_page','original_source_address','license','license_url','author','district_code','district_name_ko','placement','purpose','is_real_location_photo','location_verification','transformations','requirement_note','sha256']
with open(ROOT/'image-credits.csv','w',encoding='utf-8-sig',newline='') as f:w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(m['assets'])
