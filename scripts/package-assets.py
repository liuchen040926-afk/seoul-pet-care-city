import pathlib,zipfile
root=pathlib.Path(__file__).resolve().parents[1];out=root/'public/downloads/SEOUL_PET_CARE_CITY_ASSETS.zip';out.parent.mkdir(exist_ok=True)
files=list((root/'public/assets').rglob('*.webp'))
files += [root/p for p in ['assets-manifest.json','image-placement.md','image-credits.csv','ASSET_VALIDATION.md','README.md','src/main.jsx','src/v2.css']]
files += [root/'references/district-photo-search.json']
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for p in files:z.write(p,p.relative_to(root))
print(out,len(files),'files',out.stat().st_size,'bytes')
