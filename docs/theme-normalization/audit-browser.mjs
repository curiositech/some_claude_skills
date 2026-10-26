// Run from website/ after a direct Docusaurus build; see VERIFICATION.md.
import fs from 'node:fs';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true});
const base=process.env.THEME_BASE_URL || 'http://127.0.0.1:3240';
const axe=process.env.AXE_SOURCE; if (!axe) throw new Error('Set AXE_SOURCE to axe-core/axe.min.js');
const routes=['/','/skills','/docs/intro','/docs/skills/design_critic/','/submit-skill','/contact','/bundles','/favorites','/agents','/artifacts','/mcps','/ecosystem','/metrics','/changelog','/dag','/dag/builder','/dag/monitor','/dag/demo','/dag/lifecycle','/docs/guides/claude-skills-guide','/docs/skills/design_critic/references/assessment-rubric','/artifacts/site-reliability-engineer-integration'];
const rows=[];
try{
 for(const width of [1440,390]) for(const scheme of ['light','dark']){
 const c=await browser.newContext({viewport:{width,height:1000},isMobile:width===390,hasTouch:width===390,colorScheme:scheme,reducedMotion:'reduce'});
 const p=await c.newPage();
 for(const route of routes){
 try{
 const r=await p.goto(base+route,{waitUntil:'domcontentloaded',timeout:40000});
 await p.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.getAttribute('aria-label')?.includes('Switch between dark and light mode')&&!b.disabled));
 await p.evaluate(()=>document.fonts.ready);
 await p.addScriptTag({path:axe});
 const a=await p.evaluate(async()=>{const x=await window.axe.run(document,{runOnly:{type:'rule',values:[...new Set([...window.axe.getRules(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).map(r=>r.ruleId),'color-contrast-enhanced'])]}});return {violations:x.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,html:n.html.slice(0,200),summary:n.failureSummary,related:n.any.map(x=>x.data)}))})),incomplete:x.incomplete.map(v=>({id:v.id,count:v.nodes.length}))}});
 const meta=await p.evaluate(()=>({theme:document.documentElement.dataset.theme,choice:document.documentElement.dataset.themeChoice,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth,title:document.title}));
 const row={width,scheme,route,status:r.status(),...meta,...a};rows.push(row);fs.writeFileSync('temp/theme-normalization/audit-full-aa.json',JSON.stringify(rows,null,2));console.log(JSON.stringify({scheme,route,status:row.status,theme:row.theme,overflow:row.overflow,violations:row.violations.map(x=>[x.id,x.nodes.length])}));
 if(['/','/skills','/submit-skill','/docs/skills/design_critic/'].includes(route))await p.screenshot({path:`temp/theme-normalization/full-aa-${width}-${scheme}-${route.replaceAll('/','_')||'home'}.png`,fullPage:false});
 }catch(e){rows.push({width,scheme,route,error:e.message});console.log('ERROR',scheme,route,e.message)}
 }
 await c.close();
 }
}finally{fs.writeFileSync('temp/theme-normalization/audit-full-aa.json',JSON.stringify(rows,null,2));await browser.close()}

if(rows.some(r=>r.error||r.status!==200||r.overflow||r.violations?.length)) process.exitCode=1;
