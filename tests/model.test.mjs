import test from 'node:test';import assert from'node:assert/strict';import{ratio,rank,aggregate,pearson,sorted}from'../src/model.mjs';
test('ratio preserves null and zero denominator; keeps full precision',()=>{assert.equal(ratio(0,2),null);assert.equal(ratio(null,2),null);assert.equal(ratio(3,null),null);assert.equal(ratio(3,1),1000/3);assert.equal(ratio(4,0),0);});
test('competition rank handles ties and missing values',()=>{const a=[{v:20},{v:20},{v:10},{v:null}];assert.equal(rank(a,a[0],'v'),1);assert.equal(rank(a,a[2],'v'),3);assert.equal(rank(a,a[3],'v'),null);});
test('city ratio uses weighted total and refuses partial sums',()=>{const a=Array.from({length:25},(_,i)=>({registered_dogs:i?1000:100,veterinary_hospitals:i?1:10}));assert.equal(aggregate(a).hospitals_per_1000_dogs,34/24100*1000);a[0].veterinary_hospitals=null;assert.equal(aggregate(a).veterinary_hospitals,null);assert.equal(aggregate(a).hospitals_per_1000_dogs,null);});
test('Pearson rejects insufficient or constant samples',()=>{assert.equal(pearson([]),null);assert.equal(pearson([1,2,3].map(x=>({registered_dogs:x,veterinary_hospitals:2*x}))),1);assert.equal(pearson([1,2,3].map(x=>({registered_dogs:1,veterinary_hospitals:x}))),null);});
test('sorting does not mutate shared data and missing ranks last',()=>{const a=[{v:null},{v:10},{v:20}];assert.deepEqual(sorted(a,'v').map(x=>x.v),[20,10,null]);assert.equal(a[0].v,null);});

import fs from 'node:fs';
import {summaryFor,findings} from '../src/model.mjs';
const officialRows=JSON.parse(fs.readFileSync(new URL('../data/processed/seoul_pet_care.json',import.meta.url)));
test('Seoul aggregate is never a ranked district; district summaries use district values only',()=>{
 const city=summaryFor(officialRows);assert.equal(city.scope,'city');assert.equal(city.data.registered_dogs,612085);assert.equal(city.data.veterinary_hospitals,924);
 for(const key of ['registered_dogs','veterinary_hospitals','hospitals_per_1000_dogs']){assert.equal(city.ranks[key],null);assert.equal(rank(officialRows,city.data,key),null);}
 for(const row of officialRows){const s=summaryFor(officialRows,row.district_code);assert.equal(s.scope,'district');assert.equal(s.data,row);assert.notEqual(s.data,city.data);for(const key of ['registered_dogs','veterinary_hospitals','hospitals_per_1000_dogs'])assert.equal(s.ranks[key],1+officialRows.filter(r=>r[key]>row[key]).length);}
 assert.throws(()=>summaryFor(officialRows,'invalid'));
});
test('Research findings are computed from complete source rows and support ties',()=>{
 const f=findings(officialRows);assert.equal(f.dogsMost[0].district_name_ko,'강남구');assert.equal(f.hospitalsMost[0].veterinary_hospitals,85);assert.equal(f.ratioHighest[0].district_name_ko,'중구');assert.equal(f.ratioLowest[0].district_name_ko,'동작구');assert.equal(f.pairCount,25);assert(Math.abs(f.correlation-0.8605106548897319)<1e-12);
 const tied=officialRows.map((r,i)=>i===1?{...r,registered_dogs:39792}:r);assert.equal(findings(tied).dogsMost.length,2);
});
