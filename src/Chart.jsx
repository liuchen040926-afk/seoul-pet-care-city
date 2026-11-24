import React from 'react';
import * as d3 from 'd3';
import {metrics, fmt, rank} from './model.mjs';

export function Chart({rows,geo,selected,hovered,onSelect=()=>{},onHover=()=>{},metric='all'}) {
  const active=hovered||selected;
  const point=(r,a)=>[Math.sin(a)*r,-Math.cos(a)*r];
  const gap=Math.PI*24/180,step=(Math.PI*2-gap)/rows.length,angle=i=>gap/2+(i+.5)*step;
  const limits=metrics.map(m=>d3.scaleLinear().domain([0,d3.max(rows,r=>r[m.key])??0]).nice(4).domain()[1]);
  const bases=[340,283,230],spans=[70,40,38];
  const scales=limits.map((v,i)=>d3.scaleLinear().domain([0,v||1]).range([bases[i],bases[i]+spans[i]]));
  // Keep the enlarged, geographically accurate map entirely inside the ratio ring.
  const projection=d3.geoMercator().fitExtent([[-200,-174],[200,145]],geo),path=d3.geoPath(projection);
  const mapMetric=metrics.find(m=>m.key===metric)||metrics[2];
  const pale={registered_dogs:'#EEEAF8',veterinary_hospitals:'#E8F2F8',hospitals_per_1000_dogs:'#E5F3F0'};
  const mapMax=d3.max(rows,r=>r[mapMetric.key]);
  const colors=d3.scaleSequential(d3.interpolateRgb(pale[mapMetric.key],mapMetric.color)).domain([0,mapMax]);
  const events=r=>({tabIndex:0,role:'button','aria-label':`${r.district_name_ko}, 등록견 ${fmt(r.registered_dogs)}마리, 동물병원 ${r.veterinary_hospitals}개소, 1,000마리당 ${fmt(r.hospitals_per_1000_dogs,'hospitals_per_1000_dogs')}개소`,onClick:()=>onSelect(r.district_code),onKeyDown:e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(r.district_code);}},onMouseEnter:e=>onHover(r.district_code,e),onMouseMove:e=>onHover(r.district_code,e),onMouseLeave:()=>onHover(null),onFocus:e=>onHover(r.district_code,e),onBlur:()=>onHover(null)});
  const ratioLine=d3.lineRadial().angle((r,i)=>angle(i)).radius(r=>scales[2](r.hospitals_per_1000_dogs))(rows);
  const labelOffsets={'11110':[0,-7],'11140':[1,5],'11170':[0,9],'11290':[0,-6],'11410':[-3,0],'11590':[-3,4],'11260':[2,-5],'11230':[-2,5]};
  return <svg id="radial-chart" viewBox="-475 -475 950 950" xmlns="http://www.w3.org/2000/svg" fontFamily="Noto Sans CJK KR, Noto Sans KR, sans-serif" aria-labelledby="chart-title chart-desc">
    <title id="chart-title">서울 25개 자치구 통합 방사형 그래프</title>
    <desc id="chart-desc">2024년 3월 기준. 보라색은 누적 등록견 수, 파란색은 동물병원 수, 청록색은 등록견 1,000마리당 동물병원 수입니다. 각 층은 독립 선형 길이 척도입니다. 중앙 지도는 {mapMetric.label}를 나타냅니다. 지표 버튼을 선택하면 모든 층이 함께 정렬됩니다.</desc>
    <defs><linearGradient id="ratio-key"><stop stopColor={pale[mapMetric.key]}/><stop offset="1" stopColor={mapMetric.color}/></linearGradient></defs>
    <g fill="none" stroke="#DCE2EA" strokeWidth=".8">{bases.map((b,i)=><g key={b}>{[0,.5,1].map(t=><circle key={t} r={b+spans[i]*t} strokeDasharray={t?'2 4':undefined}/>)}</g>)}<circle r="423"/>{rows.map((r,i)=>{const a=gap/2+i*step;return <path key={r.district_code} d={`M${point(222,a)}L${point(423,a)}`}/>;})}</g>
    {metrics.slice(0,2).map((m,k)=><g data-layer={m.key} key={m.key} opacity={metric==='all'||metric===m.key?1:.22}>{rows.map((r,i)=><g className="radial-position" style={{transform:`rotate(${angle(i)}rad)`}} key={r.district_code} data-district={r.district_code} opacity={active&&active!==r.district_code ? .23 : 1} {...events(r)}><path d={d3.arc()({innerRadius:bases[k],outerRadius:bases[k]+spans[k],startAngle:-.084,endAngle:.084})} fill="transparent"/><path className="data-bar" d={d3.arc()({innerRadius:bases[k],outerRadius:scales[k](r[m.key]),startAngle:-.073,endAngle:.073})} fill={m.color} stroke={active===r.district_code?'#13213B':'none'} strokeWidth="1"/></g>)}</g>)}
    <g data-layer="hospitals_per_1000_dogs" opacity={metric==='all'||metric==='hospitals_per_1000_dogs'?1:.22}><path className="ratio-line" d={ratioLine} fill="none" stroke="#299E9A" strokeWidth="1.8" strokeLinejoin="round"/>{rows.map((r,i)=>{const p=point(scales[2](r.hospitals_per_1000_dogs),angle(i));return <g className="radial-position" style={{transform:`translate(${p[0]}px,${p[1]}px)`}} key={r.district_code} data-district={r.district_code} opacity={active&&active!==r.district_code ? .3 : 1} {...events(r)}><circle r="11" fill="transparent"/><circle className="ratio-point" r={active===r.district_code?5:3} fill="#299E9A" stroke="#F8F8F5" strokeWidth="1"/></g>;})}</g>
    <g pointerEvents="none">{metrics.map((m,k)=><g key={m.key}>{[0,.5,1].map(t=><text key={t} x="0" y={-(bases[k]+spans[k]*t)-3} textAnchor="middle" fontSize="12" fill={m.color}>{fmt(limits[k]*t,m.key)} {m.unit}</text>)}</g>)}</g>
    {rows.map((r,i)=>{const p=point(440,angle(i));return <g className="radial-position" style={{transform:`translate(${p[0]}px,${p[1]}px)`}} key={r.district_code} {...events(r)} opacity={active&&active!==r.district_code ? .45 : 1}><text className="district-radial-label" textAnchor="middle" dominantBaseline="middle" fontSize="17" fontWeight={active===r.district_code?700:500} fill="#13213B">{r.district_name_ko}</text>{metric!=='all'&&<text className="radial-rank" y="18" textAnchor="middle" fontSize="12" fill={mapMetric.color}>{rank(rows,r,metric)}위</text>}</g>;})}
    <g data-map-metric={mapMetric.key}>{geo.features.map(f=>{const r=rows.find(r=>r.district_code===f.properties.district_code);return <path className="center-map-district" data-district={r.district_code} data-original-fill={colors(r[mapMetric.key])} key={r.district_code} d={path(f)} fill={active===r.district_code?'#13213B':colors(r[mapMetric.key])} stroke="#F8F8F5" strokeWidth="1" {...events(r)}/>;})}</g>
    <g className="center-map-labels" pointerEvents="none">{geo.features.map(f=>{const r=rows.find(r=>r.district_code===f.properties.district_code),p=path.centroid(f),o=labelOffsets[r.district_code]||[0,0];return <text key={r.district_code} x={p[0]+o[0]} y={p[1]+o[1]} fontSize="13" textAnchor="middle" dominantBaseline="middle" data-original-fill={d3.lab(colors(r[mapMetric.key])).l<55?'white':'#13213B'} fill={active===r.district_code||d3.lab(colors(r[mapMetric.key])).l<55?'white':'#13213B'}>{r.district_name_ko}</text>;})}</g>
    <text y="-191" textAnchor="middle" fontSize="13" letterSpacing="2" fill="#637086">SEOUL · 2024.03</text>
    <text className="map-metric-caption" y="174" textAnchor="middle" fontSize="12" fill="#13213B">{mapMetric.label}</text>
    <rect x="-85" y="186" width="170" height="7" fill="url(#ratio-key)"/>
    <text x="-90" y="209" textAnchor="middle" fontSize="11" fill={mapMetric.color}>0</text><text x="90" y="209" textAnchor="middle" fontSize="11" fill={mapMetric.color}>{fmt(mapMax,mapMetric.key)}</text><text y="209" textAnchor="middle" fontSize="10" fill="#637086">{mapMetric.key==='hospitals_per_1000_dogs'?'1,000마리당 개소':mapMetric.unit}</text>
  </svg>;
}
