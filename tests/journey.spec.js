import {test,expect} from '@playwright/test';
const errors=[];
test.beforeEach(async({page})=>{errors.length=0;page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await page.goto('/');await expect(page.locator('#loading')).toHaveClass('done');});
test.afterEach(()=>expect(errors).toEqual([]));
test('voyage complet, accès direct, fiches et retour',async({page})=>{
 await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('#steps button')).toHaveCount(6);
 for(const [i,name] of ['Iris','Tidy Buddy','GramGramTV','AppVerdict','MyApp Hub','Pausa'].entries()){
  await page.getByRole('button',{name:`0${i+1} — ${name}`,exact:true}).click();await expect(page.locator('#summary-name')).toHaveText(name);await page.waitForTimeout(1600);
  await page.locator('#discover').click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('#detail-title')).toHaveText(name);await expect(page.locator('#detail-link')).toBeHidden();await page.getByRole('button',{name:'Fermer la présentation'}).click();
 }
 await page.getByRole('button',{name:'Revenir au premier horizon'}).click();await expect(page.locator('#summary-name')).toHaveText('Iris');
 await page.getByRole('button',{name:'Les créations',exact:true}).click();await expect(page.locator('#catalog')).toHaveClass('catalog open');await page.locator('#catalog-items button').filter({hasText:'MyApp Hub'}).click();await expect(page.locator('#summary-name')).toHaveText('MyApp Hub');
});
test('molette, clavier, mobile et tablette',async({page})=>{
 await page.mouse.wheel(0,1600);await expect(page.locator('#summary-name')).toHaveText('Tidy Buddy');
 await page.keyboard.press('End');await expect(page.locator('#summary-name')).toHaveText('Pausa');await page.keyboard.press('Home');await expect(page.locator('#summary-name')).toHaveText('Iris');
 for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:844,height:390},{width:1366,height:768}]){await page.setViewportSize(viewport);await page.waitForTimeout(800);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('#discover')).toBeInViewport();}
 await page.screenshot({path:'tests/screenshots/macbook.png'});
});
test('mouvement réduit et trente créations dynamiques',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.route('**/src/apps.js',async route=>{const response=await route.fetch();const source=await response.text();await route.fulfill({response,body:source+`\napps.push(...Array.from({length:24},(_,i)=>({...apps[i%6],id:'extended-'+i,name:'Création '+(i+7)})));`});});
 await page.reload();await expect(page.locator('#steps button')).toHaveCount(30);await page.locator('#steps button').last().click();await expect(page.locator('#summary-name')).toHaveText('Création 30');await expect(page.locator('#current-count')).toHaveText('30');
 await page.locator('#discover').click();await expect(page.locator('#detail-title')).toHaveText('Création 30');
});
test('WebGL indisponible : catalogue de secours',async({page})=>{
 await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl2'||type==='webgl')return null;return get.call(this,type,...args);};});
 await page.reload();await expect(page.locator('#fallback')).toBeVisible();await page.getByRole('button',{name:'Voir les créations'}).click();await expect(page.locator('#catalog')).toHaveClass('catalog open');
 // The expected WebGL diagnostic is deliberately logged in this fallback test.
 expect(errors.every(e=>/WebGL|paysage 3D/.test(e))).toBe(true);errors.length=0;
});
test('vidéo intégrée : autoplay muet, pause en quittant, reprise',async({page})=>{
 const bytes=await page.evaluate(async()=>{
  const c=document.createElement('canvas');c.width=160;c.height=320;const ctx=c.getContext('2d');const stream=c.captureStream(12);const recorder=new MediaRecorder(stream,{mimeType:'video/webm'});const chunks=[];recorder.ondataavailable=e=>chunks.push(e.data);const finished=new Promise(resolve=>recorder.onstop=resolve);recorder.start();
  for(let i=0;i<12;i++){ctx.fillStyle=i%2?'#97b497':'#debd95';ctx.fillRect(0,0,160,320);ctx.fillStyle='#fff9e9';ctx.beginPath();ctx.arc(80,100+i*8,30,0,Math.PI*2);ctx.fill();await new Promise(r=>setTimeout(r,85));}
  recorder.stop();await finished;stream.getTracks().forEach(t=>t.stop());return [...new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer())];
 });
 await page.route('**/assets/test-video.webm',route=>route.fulfill({status:200,contentType:'video/webm',body:Buffer.from(bytes)}));
 await page.route('**/src/apps.js',async route=>{const response=await route.fetch();await route.fulfill({response,body:(await response.text()).replace('video:null',"video:'assets/test-video.webm'")});});
 await page.addInitScript(()=>{window.testVideos=[];const create=document.createElement.bind(document);document.createElement=function(tag,...args){const el=create(tag,...args);if(tag==='video')window.testVideos.push(el);return el;};});
 await page.reload();await expect.poll(()=>page.evaluate(()=>window.testVideos[0]?.readyState)).toBeGreaterThanOrEqual(2);await expect.poll(()=>page.evaluate(()=>window.testVideos[0]?.paused)).toBe(false);expect(await page.evaluate(()=>window.testVideos[0].muted&&window.testVideos[0].playsInline)).toBe(true);
 await page.getByRole('button',{name:'02 — Tidy Buddy',exact:true}).click();await expect(page.locator('#summary-name')).toHaveText('Tidy Buddy');await expect.poll(()=>page.evaluate(()=>window.testVideos[0]?.paused)).toBe(true);
 await page.getByRole('button',{name:'01 — Iris',exact:true}).click();await expect(page.locator('#summary-name')).toHaveText('Iris');await expect.poll(()=>page.evaluate(()=>window.testVideos[0]?.paused)).toBe(false);
});
