// Force browser CSS interaction states without activating navigation or submitting forms.
import fs from 'node:fs';import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});const rows=[];
try{for(const mode of ['light','dark']){
 const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:mode,reducedMotion:'reduce'});const page=await context.newPage();
 await page.goto('http://127.0.0.1:3240/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.getAttribute('aria-label')?.includes('Switch between dark and light mode')&&!b.disabled));await page.evaluate(()=>document.fonts.ready);
 const cdp=await context.newCDPSession(page);const {root}=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:'.navbar-submit-link'});assert.ok(nodeId);
 for(const palette of ['Windows Default','Hot Dog Stand','Fluorescent','Ocean','Plasma Power Saver','Pumpkin (Large)','Rugby']){
  await page.evaluate(p=>document.documentElement.dataset.win31Palette=p,palette);
  for(const [state,pseudoClasses] of [['default',[]],['hover',['hover']],['pressed',['hover','active']],['focus',['focus','focus-visible']]]){
   await cdp.send('DOM.enable');await cdp.send('CSS.enable');await cdp.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:pseudoClasses});
   const result=await page.locator('.navbar-submit-link').evaluate(link=>{
    const rgb=c=>{const a=document.createElement('canvas').getContext('2d');a.fillStyle=c;a.fillRect(0,0,1,1);return [...a.getImageData(0,0,1,1).data].slice(0,3)};
    const luminance=c=>rgb(c).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
    const s=getComputedStyle(link);let background=s.backgroundColor;let parent=link;while(background==='rgba(0, 0, 0, 0)'&&parent.parentElement){parent=parent.parentElement;background=getComputedStyle(parent).backgroundColor}const values=[luminance(s.color),luminance(background)].sort((a,b)=>a-b);return {foreground:s.color,background,ratio:(values[1]+.05)/(values[0]+.05),theme:document.documentElement.dataset.theme};
   });assert.equal(result.theme,mode);assert.ok(result.ratio>=7,JSON.stringify({mode,palette,state,...result}));rows.push({mode,palette,state,...result});
  }
 }await context.close();
}}finally{fs.writeFileSync('temp/theme-normalization/nav-states.json',JSON.stringify(rows,null,2));await browser.close()}
console.log(JSON.stringify({cases:rows.length,minRatio:Math.min(...rows.map(r=>r.ratio))}));
