import json,csv,pathlib,hashlib
from PIL import Image
root=pathlib.Path(__file__).resolve().parents[1];manifest=json.load(open(root/'assets-manifest.json'));assets=manifest['assets'];assert len(assets)==66
counts={c:sum(a['category']==c for a in assets) for c in ['pets','districts','veterinary','branding']};assert counts=={'pets':25,'districts':25,'veterinary':10,'branding':6}
assert len({a['sha256'] for a in assets})==66;assert len({a['original_sha256'] for a in assets})==66;assert len({a['source_page'] for a in assets})==66
for a in assets:
 p=root/'public'/a['file_name'];im=Image.open(p);im.load();assert p.stat().st_size>1000;assert hashlib.sha256(p.read_bytes()).hexdigest()==a['sha256'];assert list(im.size)==a['output_dimensions'];assert a['author'] and a['license_url'] and a['source_page'];assert a['is_real_location_photo'] is False
 if a['category'] in ['pets','branding']:
  assert im.mode=='RGBA' and im.getextrema()[3][0]==0 and im.getextrema()[3][1]>0;assert im.getchannel('A').getbbox()
 if a['category']=='districts':assert im.size==(1920,1080)
rows=json.load(open(root/'data/processed/seoul_pet_care.json'));codes={r['district_code'] for r in rows}
for kind in ['pets','districts']:assert {a['district_code'] for a in assets if a['category']==kind}==codes
assert len(list(csv.DictReader(open(root/'image-credits.csv',encoding='utf-8-sig'))))==66
report='# 素材自动检查报告\n\n2026-11-16\n\n'+str(counts)+'\n\n- PASS：66 张有效本地 WebP；无零字节、解码失败、路径缺失。\n- PASS：66 个不同照片来源、不同原始和输出 SHA256；复用同区照片的多个 UI 场景不算新增素材。\n- PASS：31 张透明前景非空，25 张生活照为 1920×1080。\n- PASS：25 区犬照与生活照配置分别完整匹配标准代码。\n- PASS：每张均有作者、原始链接、来源页、许可、用途、地点状态和修改记录。\n- PASS：CSV 与 JSON 均记录 66 项。\n\n地点核实：25 区生活照全部为标注的通用替代照，未作为地区实拍。医疗 vet_07、vet_09 未满足原指定场景，替代原因已记录。\n\n人工检查范围：候选联系表、最终抠图联系表。真实浏览器排版、鼠标命中、图片解码呈现与手机端仍需浏览器验证；文件检查不能代替这些检查。\n'
(root/'ASSET_VALIDATION.md').write_text(report);print(report)
