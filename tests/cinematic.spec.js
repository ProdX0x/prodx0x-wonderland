import {test,expect} from '@playwright/test';
test('V2 active, quatre types d’appareils, assets locaux et aucune erreur JavaScript',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-environment','cinematic',{timeout:15000});await expect(page.locator('body')).toHaveClass('cinematic');await expect(page.locator('#steps button')).toHaveCount(6);
 for(const [step,name] of [[0,'Iris'],[2,'GramGramTV'],[4,'MyApp Hub'],[5,'Pausa']]){await page.locator('#steps button').nth(step).click();await expect(page.locator('#summary-name')).toHaveText(name);}
 expect(errors).toEqual([]);
});
test('V1 préservée : choix explicite et navigation complète',async({page})=>{
 await page.goto('/?quality=basic');await expect(page.locator('#world')).toHaveAttribute('data-environment','basic');await expect(page.locator('body')).not.toHaveClass('cinematic');await page.locator('#steps button').last().click();await expect(page.locator('#summary-name')).toHaveText('Pausa');await page.locator('#discover').click();await expect(page.locator('#detail-title')).toHaveText('Pausa');
});
test('asset critique invalide : repli atomique sans bloquer le catalogue',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/assets/cinematic/valley.jpg',route=>route.fulfill({status:200,contentType:'image/jpeg',body:'not an image'}));await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-environment','basic',{timeout:15000});await expect(page.locator('#world')).toHaveAttribute('data-environment-reason','asset-failure');await expect(page.locator('body')).not.toHaveClass('cinematic');await page.locator('#steps button').nth(1).click();await expect(page.locator('#summary-name')).toHaveText('Tidy Buddy');expect(errors).toEqual([]);
});
test('module V2 indisponible : le moteur V1 et les interactions démarrent',async({page})=>{
 await page.route('**/src/cinematic.js',route=>route.fulfill({status:200,contentType:'text/javascript',body:'throw new Error("Simulated unavailable enhancement");'}));await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-environment','basic');await expect(page.locator('#world')).toHaveAttribute('data-environment-reason','module-failure');await expect(page.locator('canvas')).toBeVisible();await page.locator('#steps button').nth(2).click();await expect(page.locator('#summary-name')).toHaveText('GramGramTV');
});
test('capacité limitée : aucun asset enrichi téléchargé',async({page})=>{
 const downloads=[];page.on('request',r=>{if(r.url().includes('/assets/cinematic/'))downloads.push(r.url());});await page.addInitScript(()=>Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2}));await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-environment','basic');await expect(page.locator('#world')).toHaveAttribute('data-environment-reason','capability');expect(downloads).toEqual([]);
});
test('portrait et paysage : V2 lisible, sans débordement',async({page})=>{
 await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-environment','cinematic');
 for(const viewport of [{width:390,height:844},{width:768,height:1024},{width:844,height:390},{width:1366,height:768}]){await page.setViewportSize(viewport);await expect(page.locator('#discover')).toBeInViewport();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
test('perte puis restauration du contexte : retour vers V1',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.locator('#world')).toHaveAttribute('data-environment','cinematic');
 const supported=await page.evaluate(()=>{const gl=document.querySelector('canvas').getContext('webgl2');window.restoreExtension=gl.getExtension('WEBGL_lose_context');return !!window.restoreExtension;});test.skip(!supported,'Extension non disponible');
 await page.evaluate(()=>window.restoreExtension.loseContext());await expect(page.locator('#fallback')).toBeVisible();await page.waitForTimeout(600);await page.evaluate(()=>window.restoreExtension.restoreContext());await expect(page.locator('#world')).toHaveAttribute('data-environment','basic',{timeout:10000});await expect(page.locator('#fallback')).toBeHidden();await page.locator('#steps button').nth(1).click();await expect(page.locator('#summary-name')).toHaveText('Tidy Buddy');expect(errors).toEqual([]);
});
