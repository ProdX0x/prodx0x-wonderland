import {apps as rawApps,validateApps,deviceNames} from './apps.js';
import {createWorld} from './world.js';
const apps=validateApps(rawApps),$=s=>document.querySelector(s),reduced=matchMedia('(prefers-reduced-motion: reduce)');
const steps=$('#steps'),catalog=$('#catalog'),items=$('#catalog-items'),dialog=$('#details');
let current=0,world=null,scrollUnit=innerHeight*1.55,lastShown=-1,lastIntro=null;
const pad=n=>String(n).padStart(2,'0');
$('#total-count').textContent=pad(apps.length);
function scrollToApp(i){setCatalog(false);const top=Math.max(0,Math.min(i,apps.length-1))*scrollUnit;window.scrollTo({top,behavior:reduced.matches?'instant':'smooth'});world?.retryVideo();}
function setCatalog(open){catalog.classList.toggle('open',open);catalog.inert=!open;$('.index-toggle').setAttribute('aria-expanded',String(open));if(open)$('#close-catalog').focus();}
apps.forEach((app,i)=>{
 const step=document.createElement('button');step.setAttribute('aria-label',`${pad(i+1)} — ${app.name}`);step.title=app.name;step.addEventListener('click',()=>scrollToApp(i));steps.append(step);
 const row=document.createElement('button');for(const [cls,label]of [['nav-number',pad(i+1)],['nav-title',app.name],['nav-device',deviceNames[app.device]],['nav-arrow','↗']]){const s=document.createElement('span');s.className=cls;s.textContent=label;row.append(s);}row.addEventListener('click',()=>scrollToApp(i));items.append(row);
});
function updateLayout(){const p=scrollY/scrollUnit;scrollUnit=innerHeight*1.55;$('#scroll-track').style.height=`${innerHeight+Math.max(0,apps.length-1)*scrollUnit}px`;window.scrollTo({top:p*scrollUnit,behavior:'instant'});}
updateLayout();window.addEventListener('resize',updateLayout);
const statusLabels={available:'Disponible',soon:'Bientôt disponible',development:'En développement'};
function statusLabel(s){return statusLabels[s]||'En développement';}
function showApp(index,isIntro){
 if(index===lastShown&&isIntro===lastIntro)return;current=index;lastShown=index;lastIntro=isIntro;const app=apps[index];if(!app)return;
 $('#intro-copy').hidden=!isIntro;$('#app-copy').hidden=isIntro;$('#chapter').textContent=isIntro?'LE DÉBUT D’UN VOYAGE':`CRÉATION ${pad(index+1)} / ${pad(apps.length)}`;
 $('#app-title').textContent=app.name;$('#app-tagline').textContent=app.tagline;$('#summary-name').textContent=app.name;$('#status').textContent=statusLabel(app.status);$('#device-label').textContent=`${deviceNames[app.device]} · ${app.subtitle||app.tagline}`;$('#app-icon').textContent=app.symbol;$('#app-icon').style.background=app.color;$('#discover').replaceChildren(document.createTextNode(isIntro?`Rencontrer ${app.name}`:'Découvrir l’application '));const arrow=document.createElement('span');arrow.textContent='↗';arrow.ariaHidden='true';$('#discover').append(arrow);$('#current-count').textContent=pad(index+1);$('#world-label').textContent=`${pad(index+1)} / ${app.chapter.toLocaleUpperCase('fr')}`;
 [...steps.children].forEach((step,j)=>step.setAttribute('aria-current',String(j===index)));$('#advance-label').textContent=index===apps.length-1?'Revenir au premier horizon':'Faites défiler pour explorer';
}
function showDetails(){const app=apps[current];if(!app)return;$('#detail-title').textContent=app.name;$('#detail-device').textContent=`${deviceNames[app.device]} · ${statusLabel(app.status)}`;$('#detail-tagline').textContent=app.tagline;$('#detail-description').textContent=app.description;$('#detail-tech').replaceChildren(...app.technologies.map(t=>{const s=document.createElement('span');s.textContent=t;return s;}));const link=$('#detail-link');let url=null;try{if(app.link){const parsed=new URL(app.link,location.href);if(['https:','http:'].includes(parsed.protocol))url=parsed.href;}}catch{}link.hidden=!url;if(url)link.href=url;else link.removeAttribute('href');dialog.showModal();document.body.classList.add('modal-open');}
$('#discover').addEventListener('click',showDetails);$('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
$('.index-toggle').addEventListener('click',()=>setCatalog(!catalog.classList.contains('open')));$('#close-catalog').addEventListener('click',()=>{setCatalog(false);$('.index-toggle').focus();});$('#fallback-catalog').addEventListener('click',()=>{$('#fallback').hidden=true;setCatalog(true);});$('.brand').addEventListener('click',e=>{e.preventDefault();scrollToApp(0);});$('#advance').addEventListener('click',()=>scrollToApp(current===apps.length-1?0:current+1));
window.addEventListener('keydown',e=>{if(e.key==='Escape'){setCatalog(false);return;}if(dialog.open||catalog.classList.contains('open')||/INPUT|TEXTAREA|SELECT|BUTTON|A/.test(e.target.tagName))return;let i=null;if(['ArrowDown','ArrowRight','PageDown',' '].includes(e.key))i=current+1;else if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key))i=current-1;else if(e.key==='Home')i=0;else if(e.key==='End')i=apps.length-1;if(i!==null){e.preventDefault();scrollToApp(i);}});
window.addEventListener('pointerdown',()=>world?.retryVideo(),{once:true});
if(apps.length){showApp(0,true);try{world=createWorld($('#world'),apps);$('#loading').classList.add('done');}catch(error){console.error('Impossible de démarrer le paysage 3D :',error);$('#loading').classList.add('done');$('#fallback').hidden=false;}}else{$('#loading').classList.add('done');$('#intro-copy h1').textContent='Un nouvel horizon se prépare.';$('.app-summary').hidden=true;$('#discover').hidden=true;$('#advance').hidden=true;}
let renderId;
function update(){const progress=Math.min(Math.max(0,scrollY/scrollUnit),Math.max(0,apps.length-1));world?.setProgress(progress);const actual=world?.getProgress()??progress;const index=Math.max(0,Math.min(apps.length-1,Math.round(actual)));const fraction=Math.abs(actual-index);showApp(index,actual<.12);$('.story').style.opacity=String(1-Math.pow(fraction*2,3)*.87);$('.story').style.transform=`translateY(${reduced.matches?0:fraction*9}px)`;renderId=requestAnimationFrame(update);}update();
window.addEventListener('pagehide',event=>{if(!event.persisted){cancelAnimationFrame(renderId);world?.dispose();}});

catalog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const controls=[...catalog.querySelectorAll('button')];const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
