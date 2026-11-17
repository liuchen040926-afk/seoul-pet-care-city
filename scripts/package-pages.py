"""Create a fresh GitHub-uploadable source folder and ZIP; no Git credentials/history."""
from pathlib import Path
import shutil,zipfile
root=Path(__file__).resolve().parents[1]
output=root.parent/'SEOUL-PET-CARE-CITY-GITHUB-PAGES'
archive=root.parent/'SEOUL-PET-CARE-CITY-GITHUB-PAGES.zip'
if output.exists():
    raise SystemExit(f'Refusing to replace an existing export folder: {output}')
excluded_top={'.git','.openai','node_modules','dist','work','output','.image-models','__pycache__'}
files=[]
for p in root.rglob('*'):
    rel=p.relative_to(root)
    if not p.is_file() or rel.parts[0] in excluded_top:continue
    if rel.parts[:2]==('public','data'):continue
    if p.name in {'.ui-test.mjs','.poster-render.mjs','.DS_Store'}:continue
    if p.name.startswith('.env') and p.name!='.env.example':continue
    files.append((p,rel))
for p,rel in files:
    target=output/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
with zipfile.ZipFile(archive,'w',zipfile.ZIP_DEFLATED) as z:
    for _,rel in files:z.write(output/rel,Path(output.name)/rel)
with zipfile.ZipFile(archive) as z:
    assert z.testzip() is None
    names=z.namelist()
    assert output.name+'/.github/workflows/deploy-pages.yml' in names
    assert output.name+'/src/public-url.mjs' in names
    assert len([n for n in names if '/public/assets/' in n and n.endswith('.webp')])==66
    assert not any('/.git/' in n or '/.openai/' in n or '/node_modules/' in n for n in names)
print(f'Source folder: {output}\nZIP: {archive}\nFiles: {len(files)}\nSize: {archive.stat().st_size} bytes\nZIP integrity: PASS')
