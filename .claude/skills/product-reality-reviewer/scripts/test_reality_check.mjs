import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute, join, relative, sep } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const moduleUrl = new URL('./reality_check.mjs', import.meta.url);

test('the CLI emits JSON when invoked through a discovery symlink', () => {
  const root = join(homedir(), 'coding', 'tmp');
  mkdirSync(root, { recursive: true });
  assert.equal(realpathSync(root), root, 'The test scratch root must be a real directory');
  const scratch = realpathSync(process.env.COPY_REVIEW_SCRATCH_ROOT || root);
  const suffix = relative(root, scratch);
  assert.ok(suffix !== '..' && !suffix.startsWith(`..${sep}`) && !isAbsolute(suffix),
    'COPY_REVIEW_SCRATCH_ROOT must resolve inside ~/coding/tmp');
  const fixture = mkdtempSync(join(scratch, '.product-reality-test-'));
  try {
    const discovery = join(fixture, 'discovery');
    const script = join(discovery, 'reality_check.mjs');
    const input = join(fixture, 'product.json');
    symlinkSync(fileURLToPath(new URL('.', moduleUrl)), discovery,
      process.platform === 'win32' ? 'junction' : 'dir');
    writeFileSync(input, JSON.stringify({ name: 'Fixture' }));

    const output = execFileSync(process.execPath, [script, '--input', input], { encoding: 'utf8' });
    const report = JSON.parse(output);
    assert.equal(report.name, 'Fixture');
    assert.equal(report.verdict, 'not-ready');
    assert.equal(report.summary.findingCount, 10);
  } finally {
    rmSync(fixture, { recursive: true });
  }
});

test('importing the module from stdin never starts the CLI', () => {
  const source = `await import(${JSON.stringify(moduleUrl.href)});`;
  const noArgv = execFileSync(process.execPath, ['--input-type=module', '-e', source], {
    encoding: 'utf8',
  });
  assert.equal(noArgv, '');

  const missingArgv = execFileSync(process.execPath, ['--input-type=module', '-'], {
    input: `process.argv[1] = '.missing-product-review-entry.mjs'; ${source}`,
    encoding: 'utf8',
  });
  assert.equal(missingArgv, '');
});
