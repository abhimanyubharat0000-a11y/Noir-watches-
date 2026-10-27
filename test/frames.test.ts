import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const framesDir = path.join(projectRoot, 'frames');
const publicFramesDir = path.join(projectRoot, 'public', 'frames');
const originalAssetsDir = path.join(projectRoot, 'public', 'assets', 'aistudio');

test('all 50 frames exist in /frames/ with exact sequential naming frame_001.jpg to frame_050.jpg', () => {
  assert.ok(fs.existsSync(framesDir), 'frames directory must exist in project root');
  
  for (let i = 1; i <= 50; i++) {
    const padded = String(i).padStart(3, '0');
    const filename = `frame_${padded}.jpg`;
    const fullPath = path.join(framesDir, filename);
    assert.ok(fs.existsSync(fullPath), `Frame missing: ${filename}`);
    
    const stats = fs.statSync(fullPath);
    assert.ok(stats.size > 1000, `Frame ${filename} should have non-trivial size, got ${stats.size} bytes`);
  }
});

test('all 50 frames exist in /public/frames/ for Vite and local preview compatibility', () => {
  assert.ok(fs.existsSync(publicFramesDir), 'public/frames directory must exist');
  
  for (let i = 1; i <= 50; i++) {
    const padded = String(i).padStart(3, '0');
    const filename = `frame_${padded}.jpg`;
    const fullPath = path.join(publicFramesDir, filename);
    assert.ok(fs.existsSync(fullPath), `Public frame missing: ${filename}`);
  }
});

test('all original 50 images in /public/assets/aistudio/ remain intact', () => {
  assert.ok(fs.existsSync(originalAssetsDir), 'Original assets dir must exist');
  const originals = fs.readdirSync(originalAssetsDir).filter(f => f.startsWith('ezgif-frame-') && f.endsWith('.jpg'));
  assert.equal(originals.length, 50, 'All 50 original images must be preserved');
});

test('index.html image references match actual frame files on disk', () => {
  const indexPath = path.join(projectRoot, 'index.html');
  const html = fs.readFileSync(indexPath, 'utf8');

  const cardMatches = [
    'frames/frame_012.jpg',
    'frames/frame_025.jpg',
    'frames/frame_045.jpg',
    'frames/frame_050.jpg',
    'frames/frame_001.jpg'
  ];

  for (const ref of cardMatches) {
    assert.ok(html.includes(ref), `index.html must reference ${ref}`);
    const onDisk = path.join(framesDir, path.basename(ref));
    assert.ok(fs.existsSync(onDisk), `Referenced image ${ref} must exist on disk`);
  }

  assert.ok(html.includes('FRAME_COUNT = 50;'), 'FRAME_COUNT must be configured to 50 in index.html');
});
