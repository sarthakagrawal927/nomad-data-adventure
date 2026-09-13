import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {selectCities,format,median,toCSV} from '../model.js';
const {cities}=JSON.parse(await readFile(new URL('../cities.json',import.meta.url)));
test('published dataset has unique cities and all four cost profiles',()=>{
 assert.equal(cities.length,1383);assert.equal(new Set(cities.map(c=>c.slug)).size,cities.length);
 for(const c of cities)for(const p of ['nomad','expat','local','family'])assert.equal(typeof c[`cost_for_${p}_usd_per_month`],'number');
});
test('filters combine geography, profile cost, internet and lifestyle criteria',()=>{
 const rows=selectCities(cities,{region:'Europe',profile:'expat',budget:'3000',internet:'25',walkability:'4',sort:'cost'});
 assert.ok(rows.length>0);
 for(const c of rows){assert.equal(c.region,'Europe');assert.ok(c.cost_for_expat_usd_per_month<=3000);assert.ok(c.internet_mbps>=25);assert.ok(c.walkability_score_0_to_5>=4);}
 for(let i=1;i<rows.length;i++)assert.ok(rows[i-1].cost_for_expat_usd_per_month<=rows[i].cost_for_expat_usd_per_month);
});
test('search supports accented names and combines with visa criteria',()=>{
 assert.ok(selectCities(cities,{q:'sao paulo'}).some(c=>c.name==='São Paulo'));
 assert.ok(selectCities(cities,{visa:true}).every(c=>c.has_remote_work_visa===true));
 assert.equal(selectCities(cities,{q:'does-not-exist-zzzz'}).length,0);
});
test('missing measurements are never treated as zero, and zero remains valid',()=>{
 const rows=[{name:'Missing',healthcare_score_0_to_5:null,air_quality_now:null},{name:'Zero',healthcare_score_0_to_5:0,air_quality_now:0},{name:'High',healthcare_score_0_to_5:4,air_quality_now:50}];
 assert.equal(selectCities(rows,{healthcare:'0'}).length,2);
 assert.deepEqual(selectCities(rows,{air:'0'}).map(c=>c.name),['Zero']);
 assert.equal(format(null,'money'),'Not available');assert.equal(format(0,'money'),'$0');
 assert.equal(median([null,10,20]),15);assert.equal(median([]),null);
});
test('the slider endpoint means no monthly-cost cap',()=>{
 assert.equal(selectCities(cities,{budget:'15000'}).length,1374);
 assert.ok(selectCities(cities,{budget:'1500'}).every(c=>c.cost_for_nomad_usd_per_month<=1500));
});
test('CSV quotes values and prevents formula injection while preserving numbers',()=>{
 const csv=toCSV([{name:'=1+1',note:'City, "quoted"',temperature:-5,missing:null}]);
 assert.ok(csv.includes('"\'=1+1"'));assert.ok(csv.includes('"City, ""quoted"""'));assert.ok(csv.includes('"-5"'));assert.ok(csv.endsWith('""'));
});

test('novelty Space records remain downloadable but never enter city recommendations',()=>{assert.equal(cities.filter(c=>c.region==='Space').length,9);assert.equal(selectCities(cities,{}).length,1374);assert.equal(selectCities(cities,{region:'Space'}).length,0);});
