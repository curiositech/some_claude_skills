import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
const css = readFileSync(path.resolve('src/styles/theme-tokens.css'), 'utf8');
import { COLOR_SCHEMES } from '../../hooks/useWin31Theme';

// Verify the actual authored source-role pairs in every shipped palette/theme.
function tokens(theme: string, palette: string, source = css) {
  const values: Record<string,string> = {};
  for (const block of source.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]+)\}/g)) {
    const selector = block[1].trim();
    const mode = selector.match(/data-theme='([^']+)'/);
    const choice = selector.match(/data-win31-palette='([^']+)'/);
    if ((mode && mode[1] !== theme) || (choice && choice[1] !== palette)) continue;
    for (const declaration of block[2].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) values[declaration[1]] = declaration[2].trim();
  }
  function resolve(name: string): string {
    let value = values[name];
    for (let i=0; i<20 && value?.startsWith('var('); i++) value = values[value.slice(4,-1)];
    if (!value) throw new Error(`Missing role ${name}`);
    return value;
  }
  return resolve;
}
function luminance(hex: string) {
  if (!/^#[a-f0-9]{6}$/i.test(hex)) throw new Error(`Unresolved source color ${hex}`);
  const rgb = [1,3,5].map(n => parseInt(hex.slice(n,n+2),16)/255).map(v => v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
  return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;
}
function contrast(a: string,b: string) {const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
const pairs = [
 ['--theme-accent-ink','--theme-sticker-yellow'], ['--theme-action-text','--theme-action-bg'],
 ['--theme-text','--theme-surface'], ['--theme-text','--theme-elevated'], ['--theme-text','--theme-sunken'],
 ['--theme-muted','--theme-surface'], ['--theme-muted','--theme-elevated'], ['--theme-muted','--theme-sunken'],
 ['--theme-link','--theme-surface'], ['--theme-link','--theme-elevated'], ['--theme-link-hover','--theme-surface'],
 ['--theme-titlebar-text','--theme-titlebar'], ['--theme-desktop-text','--theme-desktop'],
 ['--theme-code-text','--theme-code-bg'], ['--theme-code-muted','--theme-code-bg'],
 ['--theme-code-green','--theme-code-bg'], ['--theme-code-blue','--theme-code-bg'], ['--theme-code-amber','--theme-code-bg'],
 ['--theme-success','--theme-success-surface'], ['--theme-danger','--theme-danger-surface'],
 ['--theme-info','--theme-info-surface'], ['--theme-warning','--theme-warning-surface'],
 ...['--theme-success','--theme-danger','--theme-info','--theme-warning'].flatMap(ink => ['--theme-surface','--theme-elevated','--theme-sunken'].map(surface => [ink,surface])),
 ['--theme-field-text','--theme-field-bg'], ['--theme-inline-code-text','--theme-inline-code-bg'],
];
describe.each(Object.keys(COLOR_SCHEMES))('%s contrast contract', (palette) => {
  it.each(['light','dark'])('%s authored text role pairs meet enhanced7:1', (mode) => {
    const get=tokens(mode,palette);
    for (const [ink,surface] of pairs) expect(contrast(get(ink),get(surface)),`${mode}/${palette}: ${ink} on ${surface}`).toBeGreaterThanOrEqual(7);
  });
});

const standalone = readFileSync(path.resolve('static/hero-comparison/index.html'), 'utf8').match(/<style>([\s\S]*?)<\/style>/)![1];
describe('standalone image comparison text roles', () => {
  it.each(['light', 'dark'])('%s uses readable paired roles', mode => {
    const get = tokens(mode, '', standalone);
    for (const ink of ['--text-primary','--text-secondary','--accent-mint','--accent-pink','--accent-lavender']) {
      for (const surface of ['--bg-primary','--bg-secondary','--bg-card']) expect(contrast(get(ink),get(surface)), `${mode}: ${ink} on ${surface}`).toBeGreaterThanOrEqual(7);
    }
    for (const [ink,surface] of [['--before-ink','--before-bg'],['--after-ink','--after-bg'],['--bg-primary','--accent-mint']]) expect(contrast(get(ink),get(surface))).toBeGreaterThanOrEqual(7);
  });
});
