import assert from 'node:assert/strict';
import { skills } from '../src/data/skills';
import { validatePublishedAssets } from './validate-published-assets';

assert.equal(validatePublishedAssets(skills), skills.length);
assert.throws(() => validatePublishedAssets([]), /inventory is empty/);
assert.throws(() => validatePublishedAssets([{ id: 'missing', heroImage: '/img/absent-publication-fixture.webp' }]), /asset is absent/);
assert.throws(() => validatePublishedAssets([{ id: 'no-image' }]), /missing local hero/);
assert.throws(() => validatePublishedAssets([{ id: 'escape', heroImage: '/img/../../package.json' }]), /outside static/);
console.log('Published hero gate: actual inventory and four negative cases pass');
