// Actual Canvas text colors/background pixels, including live appearance redraw.
// Run from website/ after export; image/SVG artwork is outside this solid-text check.
import fs from 'node:fs';import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true});const rows=[];
try{const context=await browser.newContext({viewport:{width:1440,height:1000},colorScheme:'light',reducedMotion:'reduce'});
await context.addInitScript(()=>{
  const original=CanvasRenderingContext2D.prototype.fillText;
  const clear=CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect=function(...args){this.canvas.__text=[];return clear.apply(this,args)};
  CanvasRenderingContext2D.prototype.fillText=function(text,x,y,...rest){
    const p=this.getTransform().transformPoint({x,y});
    const pixel=[...this.getImageData(Math.round(p.x),Math.round(p.y),1,1).data];
    (this.canvas.__text??=[]).push({text,foreground:this.fillStyle,pixel});
    return original.call(this,text,x,y,...rest);
  };
});
const page=await context.newPage();await page.goto('http://127.0.0.1:3240/dag/lifecycle/',{waitUntil:'networkidle'});
await page.waitForFunction(()=>document.querySelector('canvas')?.__text?.some(t=>t.text==='Pending'));
async function check(state){const result=await page.locator('canvas').evaluate(canvas=>{
  const rgb=color=>{const c=document.createElement('canvas').getContext('2d');c.fillStyle=color;c.fillRect(0,0,1,1);return [...c.getImageData(0,0,1,1).data].slice(0,3)};
  const luminance=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
  let parent=canvas;let under=[255,255,255];while(parent){const color=getComputedStyle(parent).backgroundColor;if(color!=='rgba(0, 0, 0, 0)'&&color!=='transparent'){under=rgb(color);break}parent=parent.parentElement}
  return {theme:document.documentElement.dataset.theme,text:canvas.__text.map(t=>{const a=t.pixel[3]/255;const bg=t.pixel.slice(0,3).map((v,i)=>v*a+under[i]*(1-a));const fg=rgb(t.foreground);const l=[luminance(fg),luminance(bg)].sort((a,b)=>a-b);return {...t,background:bg,ratio:(l[1]+.05)/(l[0]+.05)}})};
});assert.ok(result.text.length>=5);assert.ok(result.text.every(t=>t.ratio>=7),JSON.stringify(result));rows.push({state,...result});}
for(const mode of ['light','dark']){
  await page.evaluate(mode=>{localStorage.setItem('theme',mode);document.documentElement.setAttribute('data-theme',mode)},mode);
  await page.waitForTimeout(100);await check(`${mode} phase 1 live redraw`);
  for(let i=0;i<7;i++){await page.getByRole('button',{name:'Next ▶',exact:true}).click();await page.waitForTimeout(50);await check(`${mode} phase ${i+2}`)}
  for(let i=0;i<7;i++)await page.getByRole('button',{name:'◀ Previous',exact:true}).click();
}
await context.close();}finally{fs.writeFileSync('temp/theme-normalization/canvas.json',JSON.stringify(rows,null,2));await browser.close();}
console.log(JSON.stringify({cases:rows.length,minRatio:Math.min(...rows.flatMap(r=>r.text.map(t=>t.ratio)))}));
