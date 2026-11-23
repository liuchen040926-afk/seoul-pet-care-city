import React from 'react';
import {metrics,fmt,summaryFor} from './model.mjs';
const percent=v=>new Intl.NumberFormat('ko-KR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v);
export function DataSummary({rows,selected,onSelect,onCompare,onSources}){
 const s=summaryFor(rows,selected),isDistrict=s.scope==='district';
 return <section className="district-summary" data-summary-scope={s.scope} data-summary-code={selected||'seoul'} aria-label="선택 지역 통계" aria-live="polite" translate="no">
  <div className="summary-heading"><h3>{isDistrict?s.district.district_name_ko:'서울 전체'}</h3>{isDistrict&&<button aria-label="지역 상세 닫기" onClick={()=>onSelect(null)}>선택 해제 ✕</button>}</div>
  <label className="summary-picker">지역 선택<select aria-label="요약 지역 선택" value={selected||''} onChange={e=>onSelect(e.target.value||null)}><option value="">서울 전체 · 25구 합계</option>{rows.map(r=><option key={r.district_code} value={r.district_code}>{r.district_name_ko}</option>)}</select></label>
  <p className="summary-period">2024.03 기준 · {isDistrict?'자치구 통계':'전체 합계 · 자치구 순위 제외'}</p>
  <div className="radial-totals">{metrics.map(m=>{
   const isRatio=m.key==='hospitals_per_1000_dogs',delta=s.data[m.key]-s.totals[m.key];
   return <div key={m.key} data-summary-metric={m.key}><span>{m.label}</span><strong style={{color:m.color}}><span className="summary-value">{fmt(s.data[m.key],m.key)}</span><small>{m.unit}</small></strong>
    {isDistrict?<><small className="district-rank">공동순위 {s.ranks[m.key]} / {rows.length}</small><p className="summary-context">{isRatio?`서울 전체 ${fmt(s.totals[m.key],m.key)} 대비 ${delta>0?'+':''}${percent(delta)}개소`:`서울 전체의 ${percent(s.data[m.key]/s.totals[m.key]*100)}%`}</p></>:<p className="summary-context">{isRatio?'전체 병원 합계 ÷ 전체 등록견 합계 × 1,000':`${rows.length}개 자치구 합계`}</p>}
   </div>;
  })}</div>
  <p className="summary-definition">등록견은 사망 개체를 포함한 누적 등록 수입니다. 병원 수는 보고서의 당시 집계입니다.</p>
  <button className="summary-source" onClick={onSources}>출처 · 그림 2(p.5) / 그림 6(p.9)</button>
  {isDistrict&&<button className="district-compare" onClick={()=>onCompare(selected)}>이 지역 비교하기 ↗</button>}
 </section>;
}
