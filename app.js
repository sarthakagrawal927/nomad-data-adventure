import {profiles,metrics,defaults,known,costKey,format,fold,selectCities,median,toCSV} from './model.js';
const $=selector=>document.querySelector(selector);
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
const form=$('#filters');
let cities=[],filtered=[],limit=24,selected=new Set(),filters={...defaults},preset='all',toastTimer;
const lifestyle={walkability:'Walkability',healthcare:'Healthcare',english:'English speaking',female:'Female friendliness',lgbt:'LGBTQ+ friendliness',nightlife:'Nightlife',cleanliness:'Cleanliness'};
$('#lifestyle-filters').innerHTML=Object.entries(lifestyle).map(([name,label])=>`<label class="field">${label}<select name="${name}"><option value="">Any score</option><option value="3">3+ / 5</option><option value="4">4+ / 5</option><option value="4.5">4.5+ / 5</option></select></label>`).join('');
const query=new URLSearchParams(location.search);
for(const key of Object.keys(defaults)) if(query.has(key)) filters[key]=key==='visa' ? query.get(key)==='true' : query.get(key);
if(!Object.hasOwn(profiles,filters.profile)) filters.profile='nomad';
if(!['cards','table'].includes(filters.view)) filters.view='cards';
const numericKeys=['budget','internet','safety','walkability','healthcare','english','female','lgbt','nightlife','cleanliness','tempMin','tempMax','air'];
for(const k of numericKeys) if(filters[k]!=='' && !Number.isFinite(Number(filters[k]))) filters[k]='';
const tints={'Asia':'#e8eedc','Europe':'#e8ede4','North America':'#edece1','Latin America':'#f2eadb','Africa':'#f0e9dc','Middle East':'#f0e5dc','Oceania':'#e3eeeb'};
function sourceURL(city){try{const u=new URL(city.url);return u.protocol==='https:'&&u.hostname==='nomads.com'?u.href:'https://nomads.com/';}catch{return 'https://nomads.com/';}}
function syncForm(){
 for(const [key,value] of Object.entries(filters)){const input=form.elements.namedItem(key);if(input){if(input.type==='checkbox')input.checked=value;else input.value=value;}}
 $('#search').value=filters.q;$('#sort').value=filters.sort;
 document.querySelectorAll('[data-view]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.view===filters.view));
 document.querySelectorAll('[data-preset]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.preset===preset));
 for(const detail of form.querySelectorAll('details')) if([...detail.querySelectorAll('input,select')].some(el=>el.value))detail.open=true;
}
function updateCountries(){
 const countries=[...new Set(cities.filter(c=>!filters.region||c.region===filters.region).map(c=>c.country))].sort();
 $('#country').innerHTML='<option value="">All countries & territories</option>'+countries.map(c=>`<option value="${escape(c)}">${escape(c)}</option>`).join('');
 if(filters.country&&!countries.includes(filters.country))filters.country='';
}
function saveURL(){const q=new URLSearchParams();for(const[k,v]of Object.entries(filters))if(v!==defaults[k])q.set(k,String(v));history.replaceState(null,'',location.pathname+(q.size?'?'+q:'')+location.hash);}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').hidden=false;toastTimer=setTimeout(()=>$('#toast').hidden=true,3000);}
function anomaly(value){return known(value)&&(value<100||value>30000);}
function score(value){return known(value)?value.toFixed(1):'—';}
function card(city,index){
 const amount=city[costKey(filters.profile)],checked=selected.has(city.slug);
 return `<article class="city-card ${checked?'selected':''}" style="--tint:${tints[city.region]||'#e9eddf'}"><div class="card-mast"><div class="card-meta"><span>${escape(city.region.toUpperCase())}</span><span class="rank">${String(index+1).padStart(2,'0')} ↗</span></div><button class="card-title" data-detail="${escape(city.slug)}">${escape(city.name)}</button><p class="card-country">${escape(city.country)}</p></div><div class="card-body"><div class="cost-line"><strong>${format(amount,'money')}</strong><span>/ month</span></div><p class="cost-label">${profiles[filters.profile]} cost estimate</p>${anomaly(amount)?'<p class="anomaly">Unusual source estimate</p>':''}<dl class="metric-grid"><div><dt>INTERNET</dt><dd>${known(city.internet_mbps)?`${city.internet_mbps} <small>Mbps</small>`:'—'}</dd></div><div><dt>SAFETY</dt><dd>${score(city.safety_score_0_to_5)} <small>/ 5</small></dd></div><div><dt>WALKABILITY</dt><dd>${score(city.walkability_score_0_to_5)} <small>/ 5</small></dd></div></dl><div class="score-row"><span>OVERALL</span><span class="score-track"><i style="width:${Math.min(100,Math.max(0,(city.overall_score||0)*20))}%"></i></span><b>${score(city.overall_score)}</b><span>/ 5</span></div><div class="card-actions"><button class="shortlist-button" data-compare="${escape(city.slug)}" aria-pressed="${checked}" aria-label="${checked?'Remove':'Add'} ${escape(city.name)} ${checked?'from':'to'} comparison"><span class="check" aria-hidden="true">${checked?'✓':''}</span> ${checked?'Shortlisted':'Compare'}</button><button class="text-button" data-detail="${escape(city.slug)}">City details ↗</button></div></div></article>`;
}
function table(rows){return `<div class="table-wrap"><table><thead><tr><th>City</th><th>${profiles[filters.profile]} / month</th><th>Internet</th><th>Safety</th><th>Walkability</th><th>Overall</th><th>Shortlist</th></tr></thead><tbody>${rows.map(c=>`<tr><td><button class="text-button" data-detail="${escape(c.slug)}">${escape(c.name)} ↗</button><small>${escape(c.country)}</small></td><td>${format(c[costKey(filters.profile)],'money')}${anomaly(c[costKey(filters.profile)])?'<small>Unusual estimate</small>':''}</td><td>${format(c.internet_mbps,'speed')}</td><td>${format(c.safety_score_0_to_5,'score')}</td><td>${format(c.walkability_score_0_to_5,'score')}</td><td>${format(c.overall_score,'score')}</td><td><button class="text-button" data-compare="${escape(c.slug)}" aria-pressed="${selected.has(c.slug)}">${selected.has(c.slug)?'✓ Added':'+ Compare'}</button></td></tr>`).join('')}</tbody></table></div>`;}
function render(){
 filtered=selectCities(cities,filters);const shown=filtered.slice(0,limit);
 $('#result-count').innerHTML=`<strong>${filtered.length.toLocaleString()} cities</strong> ${Object.entries(filters).some(([k,v])=>v!==defaults[k]&&!['sort','view','profile'].includes(k))?'match your search':'waiting to be explored'}`;
 $('#results').className=filters.view==='cards'?'cards':'';
 $('#results').innerHTML=shown.length?(filters.view==='cards'?shown.map(card).join(''):table(shown)):'<div class="empty" style="grid-column:1/-1"><span>⌁</span><h3>Somewhere is still out there.</h3><p>No cities match this combination. Loosen a filter and keep exploring.</p><button class="secondary" data-reset>Reset filters ↗</button></div>';
 $('#more').hidden=shown.length>=filtered.length;$('#page-count').textContent=`Showing ${shown.length.toLocaleString()} of ${filtered.length.toLocaleString()} cities`;
 const countries=new Set(filtered.map(c=>c.country)).size;
 $('#result-insights').innerHTML=`<div><strong>${format(median(filtered.map(c=>c[costKey(filters.profile)])),'money')}</strong><span>median monthly cost<br>${profiles[filters.profile].toLowerCase()} estimate</span></div><div><strong>${format(median(filtered.map(c=>c.internet_mbps)))}</strong><span>median internet<br>Mbps</span></div><div><strong>${countries}</strong><span>countries &<br>territories</span></div>`;
 const labels={q:'Search',region:'Region',country:'Country',budget:'Max cost',internet:'Min Mbps',safety:'Min safety',...lifestyle,tempMin:'Min °C',tempMax:'Max °C',air:'Max AQI',visa:'Visa reported'};
 $('#active-filters').innerHTML=Object.entries(filters).filter(([k,v])=>labels[k]&&v!==defaults[k]).map(([k,v])=>`<button data-clear="${k}" aria-label="Remove ${escape(labels[k])} filter">${escape(labels[k])}${k==='visa'?'':': '+escape(v)} &nbsp; ×</button>`).join('');
 $('#export-json').disabled=!filtered.length;$('#export-csv').disabled=!filtered.length;renderShortlist();saveURL();
}
function renderShortlist(){const rows=cities.filter(c=>selected.has(c.slug));$('#compare-bar').hidden=!rows.length;$('#compare-names').textContent=rows.map(c=>c.name).join(' · ');$('#open-compare').disabled=rows.length<2;$('#open-compare').innerHTML=`${rows.length<2?'Add one more city':'Compare '+rows.length+' cities'} <span>↗</span>`;}
function apply(){limit=24;updateCountries();syncForm();render();}
function reset(){filters={...defaults,view:filters.view};preset='all';apply();}
function showDetails(slug){const c=cities.find(c=>c.slug===slug);if(!c)return;
 $('#detail-content').innerHTML=`<p class="detail-region">${escape(c.region.toUpperCase())} / ${escape(c.country)}</p><div class="detail-heading"><h2>${escape(c.name)}</h2><div class="detail-score">${score(c.overall_score)}<small>OVERALL / 5</small></div></div><p>One place. Different ways to make it yours.</p><div class="detail-costs">${Object.entries(profiles).map(([k,label])=>`<div><span>${label} / month</span><strong>${format(c[costKey(k)],'money')}</strong>${anomaly(c[costKey(k)])?'<span class="anomaly">Unusual source estimate</span>':''}</div>`).join('')}</div><h3>Everyday life & working remotely</h3><dl class="detail-metrics">${metrics.filter(([key])=>!key.startsWith('cost_for_')&&key!=='overall_score').map(([key,label,type])=>`<div><dt>${label}</dt><dd>${format(c[key],type)}</dd></div>`).join('')}</dl><p>Weather and air quality are conditions at collection. Missing values stay unavailable. These are source estimates, not live measurements.</p><a href="${escape(sourceURL(c))}" class="primary" target="_blank" rel="noopener">Explore ${escape(c.name)} on Nomads.com ↗</a>`;
 $('#detail-dialog').showModal();}
function showComparison(){const rows=[...selected].map(slug=>cities.find(c=>c.slug===slug)).filter(Boolean);if(rows.length<2)return;
 $('#comparison-content').innerHTML=`<div class="table-wrap"><table class="compare-table"><thead><tr><th>THE DETAILS</th>${rows.map(c=>`<th class="city-column">${escape(c.name)}<small>${escape(c.country)}</small></th>`).join('')}</tr></thead><tbody>${metrics.map(([key,label,type])=>`<tr><th scope="row">${label}</th>${rows.map(c=>`<td>${format(c[key],type)}${type==='money'&&(key.startsWith('cost_for_')?anomaly(c[key]):known(c[key])&&c[key]>30000)?'<small>Unusual source estimate</small>':''}</td>`).join('')}</tr>`).join('')}<tr><th>Source</th>${rows.map(c=>`<td><a href="${escape(sourceURL(c))}" target="_blank" rel="noopener">Nomads.com ↗</a></td>`).join('')}</tr></tbody></table></div>`;$('#compare-dialog').showModal();}
function download(type){const body=type==='json'?JSON.stringify({source:'https://nomads.com/',count:filtered.length,filters,cities:filtered},null,2):toCSV(filtered);const url=URL.createObjectURL(new Blob([body],{type:type==='json'?'application/json':'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`nomad-atlas-${filtered.length}-cities.${type}`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(`Downloaded ${filtered.length.toLocaleString()} cities as ${type.toUpperCase()}`);}
form.addEventListener('submit',e=>e.preventDefault());form.addEventListener('input',e=>{const el=e.target;if(!Object.hasOwn(filters,el.name))return;filters[el.name]=el.type==='checkbox'?el.checked:el.value;preset='';apply();});
$('#search').addEventListener('input',e=>{filters.q=e.target.value;preset='';document.querySelectorAll('[data-preset]').forEach(el=>el.setAttribute('aria-pressed','false'));limit=24;render();});
$('#sort').addEventListener('change',e=>{filters.sort=e.target.value;limit=24;render();});$('#reset').addEventListener('click',reset);
$('#more').addEventListener('click',()=>{const oldCount=Math.min(limit,filtered.length);limit+=24;render();const next=$('#results').querySelectorAll(filters.view==='cards'?'.card-title':'tbody .text-button')[filters.view==='cards'?oldCount:oldCount*2];next?.focus({preventScroll:true});});
$('#mobile-filters').addEventListener('click',()=>{const open=$('#filter-panel').classList.toggle('open');$('#mobile-filters').setAttribute('aria-expanded',open);});
$('#clear-compare').addEventListener('click',()=>{selected.clear();render();});$('#open-compare').addEventListener('click',showComparison);
$('#export-json').addEventListener('click',()=>download('json'));$('#export-csv').addEventListener('click',()=>download('csv'));
for(const id of ['about','data-notes'])$('#'+id).addEventListener('click',()=>$('#about-dialog').showModal());
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.classList.contains('close-dialog'))b.closest('dialog').close();
 if(b.hasAttribute('data-detail'))showDetails(b.dataset.detail);
 if(b.hasAttribute('data-reset'))reset();
 if(b.hasAttribute('data-clear')){filters[b.dataset.clear]=defaults[b.dataset.clear];preset='';apply();}
 if(b.hasAttribute('data-view')){filters.view=b.dataset.view;syncForm();render();}
 if(b.hasAttribute('data-compare')){const slug=b.dataset.compare;if(selected.has(slug))selected.delete(slug);else if(selected.size<3)selected.add(slug);else{toast('Compare up to 3 cities. Remove one to add another.');return;}render();}
 if(b.hasAttribute('data-preset')){preset=b.dataset.preset;filters={...defaults,view:filters.view};if(preset==='budget')filters.budget='1500';if(preset==='connected')filters.internet='50';if(preset==='walkable')filters.walkability='4';if(preset==='visa')filters.visa=true;apply();}
});
for(const dialog of document.querySelectorAll('dialog'))dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
async function init(){try{
 const res=await fetch('./cities.json');if(!res.ok)throw new Error('Dataset unavailable');const data=await res.json();if(!Array.isArray(data.cities)||!data.cities.length)throw new Error('Invalid dataset');cities=data.cities.filter(city=>city.region!=='Space');
 $('#total-cities').textContent=cities.length.toLocaleString();$('#total-countries').textContent=new Set(cities.map(c=>c.country)).size;
 $('#region').innerHTML='<option value="">Anywhere in the world</option>'+[...new Set(cities.map(c=>c.region))].sort().map(r=>`<option value="${escape(r)}">${escape(r)}</option>`).join('');
 if(!cities.some(c=>c.region===filters.region))filters.region='';
 if(![...$('#sort').options].some(o=>o.value===filters.sort))filters.sort=defaults.sort;
 apply();
 }catch(error){$('#results').innerHTML='<div class="empty"><h3>The atlas could not load.</h3><p>Refresh to try again, or <a href="./cities.json">open the dataset directly</a>.</p></div>';$('#result-count').textContent='Dataset unavailable';}finally{$('#results').setAttribute('aria-busy','false');}}
init();
