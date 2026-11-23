export const metrics=[{key:'registered_dogs',label:'반려견 등록 수',unit:'마리',color:'#8064C9'},{key:'veterinary_hospitals',label:'동물병원 수',unit:'개소',color:'#4298CC'},{key:'hospitals_per_1000_dogs',label:'등록견 1,000마리당 동물병원 수',unit:'개소',color:'#299E9A'}];
export const ratio=(dogs,hospitals)=>dogs>0&&Number.isFinite(hospitals)&&hospitals>=0?hospitals/dogs*1000:null;
export const rank=(rows,row,key)=>rows.some(r=>r===row||(row.district_code&&r.district_code===row.district_code&&r[key]===row[key]))&&Number.isFinite(row[key])?1+rows.filter(x=>Number.isFinite(x[key])&&x[key]>row[key]).length:null;
export const aggregate=rows=>{const full=k=>rows.length===25&&rows.every(r=>Number.isFinite(r[k]));const d=full('registered_dogs')?rows.reduce((s,r)=>s+r.registered_dogs,0):null;const h=full('veterinary_hospitals')?rows.reduce((s,r)=>s+r.veterinary_hospitals,0):null;return {registered_dogs:d,veterinary_hospitals:h,hospitals_per_1000_dogs:ratio(d,h)};};
export function pearson(rows){const a=rows.filter(r=>Number.isFinite(r.registered_dogs)&&Number.isFinite(r.veterinary_hospitals));if(a.length<3)return null;const xs=a.map(r=>r.registered_dogs),ys=a.map(r=>r.veterinary_hospitals),mean=a=>a.reduce((s,x)=>s+x,0)/a.length,mx=mean(xs),my=mean(ys);const den=Math.sqrt(xs.reduce((s,x)=>s+(x-mx)**2,0)*ys.reduce((s,y)=>s+(y-my)**2,0));return den?xs.reduce((s,x,i)=>s+(x-mx)*(ys[i]-my),0)/den:null;}
export const fmt=(v,key)=>v==null?'—':new Intl.NumberFormat('ko-KR',{minimumFractionDigits:key==='hospitals_per_1000_dogs'?2:0,maximumFractionDigits:key==='hospitals_per_1000_dogs'?2:0}).format(v);
export function sorted(rows,key){return [...rows].sort(key==='name'?(a,b)=>a.district_name_ko.localeCompare(b.district_name_ko,'ko'):key==='default'?()=>0:(a,b)=>(b[key]??-Infinity)-(a[key]??-Infinity));}

// A city total is an aggregate, never a competitor in the district ranking.
export function summaryFor(rows,code=null){
 const district=code?rows.find(r=>r.district_code===code):null;
 if(code&&!district)throw new Error('Unknown district code');
 const totals=aggregate(rows);
 return {scope:district?'district':'city',district,data:district||totals,totals,ranks:Object.fromEntries(metrics.map(m=>[m.key,district?rank(rows,district,m.key):null]))};
}
export function findings(rows){
 const extremes=(key,direction)=>{const valid=rows.filter(r=>Number.isFinite(r[key]));if(!valid.length)return [];const value=Math[direction](...valid.map(r=>r[key]));return valid.filter(r=>r[key]===value);};
 return {dogsMost:extremes('registered_dogs','max'),hospitalsMost:extremes('veterinary_hospitals','max'),ratioHighest:extremes('hospitals_per_1000_dogs','max'),ratioLowest:extremes('hospitals_per_1000_dogs','min'),correlation:pearson(rows),pairCount:rows.filter(r=>Number.isFinite(r.registered_dogs)&&Number.isFinite(r.veterinary_hospitals)).length};
}
