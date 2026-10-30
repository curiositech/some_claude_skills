/** Public header regression: flow geometry, native sidebar, site links and text reflow.
 * Run with HEADER_PLAYWRIGHT_MODULE pointing to an installed @playwright/test/index.mjs
 * when Playwright is supplied by the host rather than this documentation package.
 * HEADER_TEST_URL defaults to the local Docusaurus server on port3187.
 */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.HEADER_PLAYWRIGHT_MODULE || '@playwright/test');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, '.scratch/header-regression');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--disable-gpu'] });
const records=[];
try {
 for(const theme of ['light','dark']) {
  const context=await browser.newContext({colorScheme:theme,viewport:{width:1280,height:800}});
  await context.addInitScript(value=>localStorage.setItem('theme',value),theme);
  const page=await context.newPage();
  await page.goto(process.env.HEADER_TEST_URL || 'http://127.0.0.1:3187',{waitUntil:'domcontentloaded'});
  await page.locator('.site-switcher-row').waitFor();
  await page.waitForTimeout(1500);
  for(const width of [320,390,768,1000,1280,1440])for(const scale of [1,2]){
   await page.setViewportSize({width,height:900});
   await page.evaluate(scale=>{
    document.querySelectorAll('[data-header-base-font]').forEach(el=>el.style.removeProperty('font-size'));
    // The atomic site wordmark is a logotype; enlarge navigation text independently.
    const nodes=document.querySelectorAll('.navbar__link,.navbar__toggle,.navbar-hire-link,.site-switcher-row button');
    nodes.forEach(el=>{const size=Number.parseFloat(getComputedStyle(el).fontSize);el.dataset.headerBaseFont=String(size);if(scale===2)el.style.setProperty('font-size',`${size*2}px`,'important');});
   },scale);
   await page.waitForTimeout(200);
   const geometry=await page.evaluate(()=>{
    const rect=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height,text:el.innerText?.slice(0,50)};};
    const items=[...document.querySelectorAll('.navbar__inner > .navbar__items > *')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(el).visibility!=='hidden';}).map(rect);
    const collisions=[];for(let a=0;a<items.length;a++)for(let b=a+1;b<items.length;b++){const x=Math.min(items[a].right,items[b].right)-Math.max(items[a].x,items[b].x),y=Math.min(items[a].bottom,items[b].bottom)-Math.max(items[a].y,items[b].y);if(x>1&&y>1)collisions.push([items[a],items[b]]);}
    return{theme:document.documentElement.dataset.theme,items,collisions,escapes:items.filter(r=>r.x<-.5||r.right>innerWidth+.5),switcher:rect(document.querySelector('.site-switcher-row')),navbar:rect(document.querySelector('.navbar'))};
   });
   assert.equal(geometry.theme,theme,'Native appearance must match requested theme');
   assert.deepEqual(geometry.collisions,[],`${theme}/${width}/${scale}: header controls overlap`);
   assert.deepEqual(geometry.escapes,[],`${theme}/${width}/${scale}: header controls escape viewport`);
   assert(geometry.switcher.bottom<=geometry.navbar.y+1,'Sites row must reserve real flow space');
   const sites=page.getByRole('button',{name:'Switch site',exact:true});await sites.focus();await page.keyboard.press('Enter');
   const links=page.getByRole('navigation',{name:'Some Claude Skills sites',exact:true});await links.waitFor({state:'visible'});
   assert.equal(await links.getByRole('link',{name:/Desktop OS/}).getAttribute('href'),'https://os2.someclaudeskills.com');
   await page.keyboard.press('Tab');assert(await links.evaluate(el=>el.contains(document.activeElement)),'Tab reaches site destination');
   await page.keyboard.press('Escape');assert(await sites.evaluate(el=>el===document.activeElement),'Escape restores Sites focus');
   if(width<=996){const menu=page.getByRole('button',{name:'Toggle navigation bar',exact:true});await menu.click();await page.locator('.navbar-sidebar').waitFor({state:'visible'});assert(await page.locator('.navbar-sidebar').getByText('Skills',{exact:true}).count()>0,'Native sidebar keeps destinations');await page.getByRole('button',{name:'Close navigation bar',exact:true}).click();}
   await page.screenshot({path:path.join(output,`${theme}-${width}-${scale}x.png`)});
   records.push({theme,width,textScale:scale,geometry});
  }
  await context.close();
 }
}finally{await browser.close();}
await writeFile(path.join(output,'evidence.json'),JSON.stringify(records,null,2)+'\n');
console.log(`Passed ${records.length} theme/viewport/text geometry cases and site/sidebar keyboard checks.`);
