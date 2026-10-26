import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { skills } from '../src/data/skills';

const staticRoot = fileURLToPath(new URL('../static/', import.meta.url));
type PublishedSkill = { id: string; heroImage?: string };

export function validatePublishedAssets(published: PublishedSkill[], root = staticRoot) {
  if (!published.length) throw new Error('Published skill inventory is empty');
  for (const skill of published) {
    const image = skill.heroImage;
    if (!image?.startsWith('/img/')) throw new Error(`${skill.id}: missing local hero image`);
    const target = path.resolve(root, '.' + image);
    const relative = path.relative(path.resolve(root), target);
    if (relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
      throw new Error(`${skill.id}: published hero asset is absent or outside static/: ${image}`);
    }
  }
  return published.length;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`Published hero assets: ${validatePublishedAssets(skills)} verified`);
}
