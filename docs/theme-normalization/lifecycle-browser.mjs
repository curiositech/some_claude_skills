// Run from website/ after a direct Docusaurus build; see VERIFICATION.md.
import fs from 'node:fs';import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const b=await chromium.launch({headless:true});const rows=[];
const origin='http://127.0.0.1:3240';
async function state(p,theme,choice){await p.waitForFunction(([t,c])=>document.documentElement.dataset.theme===t&&document.documentElement.dataset.themeChoice===c,[theme,choice],{timeout:5000});}
async function ready(p){await p.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>{const c=document.documentElement.dataset.themeChoice;return !b.disabled&&b.getAttribute('aria-label')?.includes('currently '+c+' mode')}));}
function toggle(p){return p.locator('button[aria-label*="Switch between dark and light mode"]').filter({visible:true}).first();}
try{
 const pre=await b.newContext({colorScheme:'dark'});await pre.route('**/*.js',r=>r.abort());const q=await pre.newPage();await q.goto(origin,{waitUntil:'domcontentloaded'});await state(q,'dark','system');rows.push({test:'native prepaint with React bundles blocked',pass:true});await pre.close();
 const c=await b.newContext({colorScheme:'dark',viewport:{width:1440,height:1000},reducedMotion:'reduce'});const p=await c.newPage();await p.goto(origin,{waitUntil:'domcontentloaded'});await ready(p);await state(p,'dark','system');
 await toggle(p).click();await state(p,'light','light');
 const p2=await c.newPage();await p2.goto(origin+'/submit-skill/',{waitUntil:'domcontentloaded'});await ready(p2);await state(p2,'light','light');
 await toggle(p).click();await state(p,'dark','dark');await state(p2,'dark','dark');
 await p.reload({waitUntil:'domcontentloaded'});await ready(p);await state(p,'dark','dark');await p.emulateMedia({colorScheme:'light'});await state(p,'dark','dark');
 await toggle(p).click();await state(p,'light','system');await p.emulateMedia({colorScheme:'dark'});await state(p,'dark','system');rows.push({test:'cycle, saved reload, explicit preference, live OS, cross-tab',pass:true});
 await p.locator('summary.theme-picker__btn').filter({visible:true}).click();await p.getByRole('radio',{name:'Ocean',exact:true}).click();await p.keyboard.press('Escape');await p.reload({waitUntil:'domcontentloaded'});await ready(p);await p.waitForFunction(()=>document.documentElement.dataset.win31Palette==='Ocean');assert.equal(await p.evaluate(()=>document.documentElement.dataset.win31Palette),'Ocean');await state(p,'dark','system');rows.push({test:'palette persistence independent of appearance',pass:true});
 await c.close();
 for(const width of [320,390,768]){const cx=await b.newContext({viewport:{width,height:844},colorScheme:'dark',reducedMotion:'reduce'});const m=await cx.newPage();await m.goto(origin+'/submit-skill/',{waitUntil:'domcontentloaded'});await ready(m);await state(m,'dark','system');if(!await toggle(m).isVisible())await m.getByRole('button',{name:'Toggle navigation bar'}).click();await toggle(m).click();await state(m,'light','light');assert.equal(await m.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);rows.push({test:'mobile appearance control and reflow',width,pass:true});await m.screenshot({path:`temp/theme-normalization/mobile-${width}-control.png`});await cx.close();}
 const blocked=await b.newContext({colorScheme:'dark'});await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw new Error('blocked')};Storage.prototype.setItem=()=>{throw new Error('blocked')};Storage.prototype.removeItem=()=>{throw new Error('blocked')};});const s=await blocked.newPage();const errors=[];s.on('pageerror',e=>errors.push(e.message));await s.goto(origin,{waitUntil:'domcontentloaded'});await ready(s);await state(s,'dark','system');await toggle(s).click();await state(s,'light','light');assert.deepEqual(errors,[]);rows.push({test:'blocked browser storage',pass:true});await blocked.close();
} catch(e){rows.push({pass:false,error:e.stack});console.log(e.stack);process.exitCode=1;}finally{fs.writeFileSync('temp/theme-normalization/lifecycle.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows));await b.close()}
