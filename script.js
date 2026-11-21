const KEY='pulseHealthTracker_v1';
const today=()=>new Date().toISOString().slice(0,10);
const fresh=()=>({profile:{name:'',age:'',height:'',weight:''},activity:{},water:{},sleep:{},food:{}});
let data=load();
function load(){try{return {...fresh(),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch(e){return fresh()}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));render()}
function dayData(group,date=today()){return data[group][date]||(data[group][date]=group==='water'||group==='food'?[]:{});}
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}
function fmt(n){return Number(n||0).toLocaleString('en-IN')}
function pct(a,b){return Math.min(100,Math.round((Number(a||0)/b)*100))}
function setText(id,value){document.getElementById(id).textContent=value}
function navigate(page){document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id===page));document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===page));const names={dashboard:'Good day! 👋',activity:'Activity tracker',water:'Water tracker',sleep:'Sleep tracker',food:'Nutrition tracker',bmi:'BMI calculator',history:'Your health history',profile:'My profile'};setText('pageTitle',names[page]||'Pulse');window.scrollTo({top:0,behavior:'smooth'});render()}
document.querySelectorAll('nav button').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.go)));
setText('todayLabel',new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'}));

function activityToday(){return data.activity[today()]||{steps:0,minutes:0}}
function waterToday(){return data.water[today()]||[]}
function sleepLatest(){const keys=Object.keys(data.sleep).sort();return keys.length?data.sleep[keys[keys.length-1]]:{hours:0}}
function foodToday(){return data.food[today()]||[]}
function sum(arr,key){return arr.reduce((a,x)=>a+Number(x[key]||0),0)}
function render(){
 const a=activityToday(),w=sum(waterToday(),'ml'),s=sleepLatest().hours||0,c=sum(foodToday(),'calories');
 setText('dashSteps',fmt(a.steps));setText('stepsSub','Goal: 8,000 steps');document.getElementById('stepsProgress').style.width=pct(a.steps,8000)+'%';
 setText('dashWater',fmt(w)+' ml');setText('waterSub','Goal: 2,000 ml');document.getElementById('waterProgress').style.width=pct(w,2000)+'%';
 setText('dashSleep',Number(s).toFixed(1).replace('.0','')+'h');document.getElementById('sleepProgress').style.width=pct(s,8)+'%';
 setText('dashCalories',fmt(c));document.getElementById('calProgress').style.width=pct(c,2000)+'%';
 setText('activityTotal',fmt(a.steps));document.getElementById('activityProgress').style.width=pct(a.steps,8000)+'%';
 setText('waterTotal',fmt(w)+' ml');setText('waterRemaining',w>=2000?'Daily example goal reached!':fmt(2000-w)+' ml to example goal');document.getElementById('waterPageProgress').style.width=pct(w,2000)+'%';
 setText('sleepTotal',Number(s).toFixed(1).replace('.0','')+'h');document.getElementById('sleepPageProgress').style.width=pct(s,8)+'%';
 setText('foodTotal',fmt(c)+' kcal');document.getElementById('foodProgress').style.width=pct(c,2000)+'%';
 renderBars();renderLists();renderHistory();renderChecklist();renderProfile();
}
function renderBars(){const el=document.getElementById('weeklyBars');el.innerHTML='';let max=1;const days=[];for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let k=d.toISOString().slice(0,10),v=(data.activity[k]||{}).steps||0;days.push({label:d.toLocaleDateString('en',{weekday:'short'}),v});max=Math.max(max,v)}days.forEach(x=>{const w=document.createElement('div');w.className='bar-wrap';const bar=document.createElement('div');bar.className='bar';bar.style.height=Math.max(3,x.v/max*135)+'px';bar.title=fmt(x.v)+' steps';const val=document.createElement('small');val.textContent=x.v?fmt(x.v):'–';const lab=document.createElement('span');lab.textContent=x.label;w.append(bar,val,lab);el.append(w)})}
function listHTML(items,empty){if(!items.length)return `<div class="empty">${empty}</div>`;return `<div class="list">${items.join('')}</div>`}
function row(title,sub,right,del){return `<div class="list-item"><div><strong>${escapeHTML(title)}</strong><small>${escapeHTML(sub)}</small></div><div style="display:flex;align-items:center;gap:10px"><b>${right}</b>${del||''}</div></div>`}
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderLists(){
 const a=Object.keys(data.activity).sort().reverse().slice(0,7).map(k=>row(k,`${data.activity[k].minutes||0} exercise minutes`,fmt(data.activity[k].steps||0)+' steps'));
 document.getElementById('activityList').innerHTML=listHTML(a,'No activity records yet. Add your first entry above.');
 const w=waterToday().map((x,i)=>row(fmt(x.ml)+' ml water',x.time,'💧',`<button class="btn danger" data-delete="water:${i}">×</button>`));
 document.getElementById('waterList').innerHTML=listHTML(w,'No water logged today. Add a glass of water to get started.');
 const sl=Object.keys(data.sleep).sort().reverse().slice(0,7).map(k=>row(k,`${data.sleep[k].bed} – ${data.sleep[k].wake}`,Number(data.sleep[k].hours).toFixed(1)+' hrs'));
 document.getElementById('sleepList').innerHTML=listHTML(sl,'No sleep records yet. Record last night’s sleep above.');
 const f=foodToday().map((x,i)=>row(x.name,`${x.meal} · ${x.time}`,fmt(x.calories)+' kcal',`<button class="btn danger" data-delete="food:${i}">×</button>`));
 document.getElementById('foodList').innerHTML=listHTML(f,'No meals logged today. Add a meal above.');
 document.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>{let [g,i]=b.dataset.delete.split(':');data[g][today()].splice(Number(i),1);save();toast('Entry removed')}));
}
function renderChecklist(){const a=activityToday(),w=sum(waterToday(),'ml'),s=sleepLatest().hours||0;const checks=[['Walk 8,000 steps',a.steps>=8000],['Drink 2,000 ml water',w>=2000],['Get around 8 hours sleep',s>=7&&s<=9],['Log a meal',foodToday().length>0]];document.getElementById('checklist').innerHTML=checks.map(x=>`<div class="goal-row"><span>${x[1]?'✓':'○'} &nbsp;${x[0]}</span><span class="pill">${x[1]?'Completed':'In progress'}</span></div>`).join('')}
function renderHistory(){setText('historyActivity',Object.keys(data.activity).length);setText('historyWater',Object.values(data.water).reduce((n,a)=>n+a.length,0));setText('historySleep',Object.keys(data.sleep).length);let dates=[...new Set([...Object.keys(data.activity),...Object.keys(data.water),...Object.keys(data.sleep),...Object.keys(data.food)])].sort().reverse().slice(0,14);let rows=dates.map(k=>row(k,`${fmt((data.activity[k]||{}).steps||0)} steps · ${fmt(sum(data.water[k]||[],'ml'))} ml water`,`${Number((data.sleep[k]||{}).hours||0).toFixed(1)} hrs sleep`));document.getElementById('historyList').innerHTML=listHTML(rows,'Your saved daily summaries will appear here.')}
function renderProfile(){const p=data.profile||{};document.getElementById('profileName').value=p.name||'';document.getElementById('profileAge').value=p.age||'';document.getElementById('profileHeight').value=p.height||'';document.getElementById('profileWeight').value=p.weight||'';setText('profileNameDisplay',p.name||'Your profile')}
document.getElementById('saveActivity').addEventListener('click',()=>{let steps=Number(document.getElementById('stepsInput').value),minutes=Number(document.getElementById('exerciseInput').value);if(!Number.isFinite(steps)||steps<0||!Number.isFinite(minutes)||minutes<0){toast('Enter valid non-negative numbers');return}data.activity[today()]={steps,minutes};save();setText('activityResult',`Saved ${fmt(steps)} steps and ${fmt(minutes)} exercise minutes for today.`);toast('Activity saved')});
document.getElementById('addSteps').addEventListener('click',()=>{let a=activityToday();data.activity[today()]={...a,steps:Number(a.steps||0)+500};save();setText('activityResult','Added 500 steps to today’s total.');toast('500 steps added')});
document.querySelectorAll('[data-water]').forEach(b=>b.addEventListener('click',()=>addWater(Number(b.dataset.water))));
function addWater(ml){if(!Number.isFinite(ml)||ml<=0){toast('Enter a valid amount');return}dayData('water').push({ml,time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})});save();toast('Water entry added')}
document.getElementById('addWater').addEventListener('click',()=>{let v=Number(document.getElementById('waterInput').value);if(!v||v<1){toast('Enter an amount above 0');return}addWater(v);document.getElementById('waterInput').value=''});
document.getElementById('saveSleep').addEventListener('click',()=>{let bed=document.getElementById('bedTime').value,wake=document.getElementById('wakeTime').value;if(!bed||!wake){toast('Choose both times');return}let [bh,bm]=bed.split(':').map(Number),[wh,wm]=wake.split(':').map(Number),mins=(wh*60+wm)-(bh*60+bm);if(mins<=0)mins+=1440;let hours=mins/60;data.sleep[today()]={bed,wake,hours};save();setText('sleepResult',`Saved ${hours.toFixed(1)} hours of sleep.`);toast('Sleep record saved')});
document.getElementById('saveFood').addEventListener('click',()=>{let name=document.getElementById('foodName').value.trim(),cal=Number(document.getElementById('foodCalories').value),meal=document.getElementById('mealType').value;if(!name||!Number.isFinite(cal)||cal<0){toast('Enter a food name and valid calories');return}dayData('food').push({name,calories:cal,meal,time:new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})});save();document.getElementById('foodName').value='';document.getElementById('foodCalories').value='';toast('Food entry saved')});
document.getElementById('calculateBmi').addEventListener('click',()=>{let h=Number(document.getElementById('heightInput').value),w=Number(document.getElementById('weightInput').value);if(h<=0||w<=0||!Number.isFinite(h)||!Number.isFinite(w)){toast('Enter valid height and weight');return}let bmi=w/((h/100)**2),cat=bmi<18.5?'Underweight':bmi<25?'Healthy range':bmi<30?'Overweight':'Obesity range';let r=document.getElementById('bmiResult');r.style.display='block';r.innerHTML=`Your BMI is <b>${bmi.toFixed(1)}</b> — <b>${cat}</b>.<br><small>This is a general screening estimate, not a diagnosis.</small>`});
document.getElementById('useProfile').addEventListener('click',()=>{document.getElementById('heightInput').value=data.profile.height||'';document.getElementById('weightInput').value=data.profile.weight||'';toast('Profile details copied')});
document.getElementById('saveProfile').addEventListener('click',()=>{data.profile={name:document.getElementById('profileName').value.trim(),age:document.getElementById('profileAge').value,height:document.getElementById('profileHeight').value,weight:document.getElementById('profileWeight').value};save();toast('Profile saved')});
document.getElementById('exportData').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='pulse-health-data.json';a.click();URL.revokeObjectURL(url);toast('Backup exported')});
document.getElementById('clearData').addEventListener('click',()=>{if(confirm('Delete all Pulse health tracker data saved in this browser? This cannot be undone.')){data=fresh();localStorage.removeItem(KEY);save();toast('Local data cleared')}});
render();
