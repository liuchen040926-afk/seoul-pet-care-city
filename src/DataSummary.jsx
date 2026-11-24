import React from 'react';
import {metrics,fmt,summaryFor} from './model.mjs';
export function DataSummary({rows,selected,onSelect,onCompare,onSources}){
 const s=summaryFor(rows,selected),isDistrict=s.scope==='district';
 return <section className="district-summary" data-summary-scope={s.scope} data-summary-code={selected||'seoul'} aria-label="선택 지역 통계" aria-live="polite" translate="no">
  <div className="summary-heading"><h3>{isDistrict?s.district.district_name_ko:'서울 전체'}</h3>{isDistrict&&<button aria-label="지역 상세 닫기" onClick={()=>onSelect(null)}>선택 해제 ✕</button>}</div>
  <label className="summary-picker">지역 선택<select aria-label="요약 지역 선택" value={selected||''} onChange={e=>onSelect(e.target.value||null)}><option value="">서울 전체 · 25구 합계</option>{rows.map(r=><option key={r.district_code} value={r.district_code}>{r.district_name_ko}</option>)}</select></label>
  <div className="radial-totals">{metrics.map(m=>{
   return <div key={m.key} data-summary-metric={m.key}><span>{m.key==='registered_dogs'?'등록견 수':m.key==='veterinary_hospitals'?'동물병원':'1,000마리당 병원'}</span><strong style={{color:m.color}}><span className="summary-value">{fmt(s.data[m.key],m.key)}</span><small>{m.unit}</small></strong>
    {isDistrict&&<small className="district-rank">공동순위 {s.ranks[m.key]} / {rows.length}</small>}
   </div>;
  })}</div>
  <button className="summary-source" onClick={onSources}>출처 · 통계 기준</button>
  {isDistrict&&<button className="district-compare" onClick={()=>onCompare(selected)}>이 지역 비교하기 ↗</button>}
 </section>;
}
