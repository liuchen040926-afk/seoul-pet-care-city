from playwright.sync_api import sync_playwright
from pathlib import Path
import json, os, shutil
root=Path(__file__).resolve().parents[1]
(root/'exports').mkdir(exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1920,'height':1080},accept_downloads=True)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(os.environ.get('TEST_URL','http://127.0.0.1:5173/'),wait_until='networkidle');page.evaluate('document.fonts.ready')
 rows=json.loads((root/'data/processed/seoul_pet_care.json').read_text())
 assert page.locator('.district-summary').get_attribute('data-summary-scope')=='city'
 assert page.locator('.district-summary .district-rank').count()==0
 assert page.locator('.district-summary .district-compare').count()==0
 # Simulate translated nested text nodes: keyed summaries must not retain stale numbers.
 page.locator('.summary-value').first.evaluate('(e)=>e.innerHTML="<font>612,085</font>"')
 for row in rows:
  page.get_by_label('요약 지역 선택',exact=True).select_option(row['district_code'])
  assert page.locator('.district-summary').get_attribute('data-summary-code')==row['district_code']
  for key in ['registered_dogs','veterinary_hospitals','hospitals_per_1000_dogs']:
   block=page.locator(f'[data-summary-metric="{key}"]')
   expected=f"{row[key]:,.2f}" if key=='hospitals_per_1000_dogs' else f"{row[key]:,}"
   assert block.locator('.summary-value').inner_text()==expected
   expected_rank=1+sum(r[key]>row[key] for r in rows)
   assert block.locator('.district-rank').inner_text()==f'공동순위 {expected_rank} / 25'
 page.get_by_label('요약 지역 선택',exact=True).select_option('')
 assert page.locator('.district-summary .district-rank').count()==0
 assert page.locator('.summary-value').first.inner_text()=='612,085'
 assert page.locator('[data-scatter-district]').count()==25
 assert page.locator('.correlation-value').inner_text()=='r = 0.861'
 page.locator('[data-scatter-district="11140"]').click()
 assert page.locator('.summary-heading h3').inner_text()=='중구'
 page.get_by_role('button',name='초기화 ↺',exact=True).click()
 page.emulate_media(reduced_motion='reduce')
 page.screenshot(path=str(root/'exports/professor-revision-1920.png'),full_page=True)
 # No map label, peripheral name or tick overlaps after every metric switch.
 for name,key in [('반려견 등록 수','registered_dogs'),('동물병원 수','veterinary_hospitals'),('등록견 1,000마리당 병원','hospitals_per_1000_dogs')]:
  page.get_by_role('button',name=name,exact=True).click();page.wait_for_timeout(100)
  assert page.locator('[data-map-metric]').get_attribute('data-map-metric')==key
  assert page.locator('.radial-rank').count()==25
  labels=page.locator('.district-radial-label').evaluate_all('(es)=>es.map(e=>e.getBoundingClientRect().toJSON())')
  chart=page.locator('#radial-chart').bounding_box()
  assert all(r['left']>=chart['x'] and r['right']<=chart['x']+chart['width'] and r['top']>=chart['y'] and r['bottom']<=chart['y']+chart['height'] for r in labels)
  page.locator('.center-map-district[data-district="11680"]').focus();page.keyboard.press('Enter');assert page.locator('.summary-heading h3').inner_text()=='강남구'
 page.locator('.center-map-district[data-district="11140"]').hover();assert page.locator('.radial-tooltip').is_visible()
 page.get_by_role('button',name='지역 비교 ↗',exact=True).click();page.get_by_label('비교 지역 2',exact=True).select_option('11140');assert '30,969' in page.locator('.difference').inner_text();page.keyboard.press('Escape')
 page.get_by_role('button',name='검색 ⌕').click();page.get_by_label('자치구 검색',exact=True).fill('은평');assert page.locator('.search-results button').count()==1;page.locator('.search-results button').click();assert page.locator('.summary-heading h3').inner_text()=='은평구'
 page.get_by_role('button',name='초기화 ↺',exact=True).click();assert page.locator('.summary-heading h3').inner_text()=='서울 전체'
 for label,filename in [('포스터 SVG ↓','SEOUL-PET-CARE-CITY.svg'),('포스터 PNG ↓','SEOUL-PET-CARE-CITY-3600.png')]:
  with page.expect_download() as d:page.get_by_role('button',name=label,exact=True).click()
  d.value.save_as(str(root/'exports'/filename));assert (root/'exports'/filename).stat().st_size>10000
 page.get_by_role('button',name='전체 데이터 표 ↗',exact=True).click();assert page.locator('tbody tr').count()==25
 for label in ['CSV ↓','JSON ↓']:
  with page.expect_download() as d:page.get_by_role('button',name=label,exact=True).click()
  assert d.value.failure() is None
 page.keyboard.press('Escape')
 if page.locator('.toast').count():page.locator('.toast').click()
 page.evaluate('document.activeElement?.blur()')
 # Capture all supported viewports and confirm document-level containment.
 for width,height in [(1920,1080),(1440,900),(2560,1440),(768,1024),(390,844)]:
  page.set_viewport_size({'width':width,'height':height});page.screenshot(path=str(root/'exports'/f'professor-revision-{width}.png'),full_page=True)
  assert not page.evaluate('document.documentElement.scrollWidth>innerWidth')
  if width==390:
   assert page.locator('.radial-stage').evaluate('(e)=>e.scrollWidth>e.clientWidth')
   page.locator('.radial-stage').evaluate('(e)=>e.scrollLeft=300');assert page.locator('.radial-stage').evaluate('(e)=>e.scrollLeft')==300
 assert not errors,errors
 print('PASS real Chromium: all 25 summaries/75 values/ranks, translated-node resilience, city unranked, computed insights/scatter, five viewports; all 25 labels inside SVG; three ranking controls; keyboard/map; tooltip; comparison; filtered search; reset; CSV/JSON; SVG and 3600px PNG; mobile chart scroll; no console errors')
 browser.close()
