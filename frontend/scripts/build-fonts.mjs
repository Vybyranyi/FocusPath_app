/**
 * Converts the bundled Montserrat faces from TTF to WOFF2.
 *
 * They shipped as four .ttf files of roughly 330 KB each — about 1.3 MB of
 * font for a habit tracker. WOFF2 is Brotli-compressed and every browser this
 * app supports reads it.
 *
 * Run with `npm run build:fonts` after replacing or adding a face. The .woff2
 * files are committed, so a normal install and build need not run this.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compress } from 'wawoff2';

const FONT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'assets', 'fonts');

const files = (await readdir(FONT_DIR)).filter((f) => f.endsWith('.ttf'));
if (files.length === 0) {
  console.error(`No .ttf files in ${FONT_DIR}`);
  process.exit(1);
}

let before = 0;
let after = 0;

for (const file of files) {
  const ttf = await readFile(join(FONT_DIR, file));
  const woff2 = await compress(ttf);
  const out = `${basename(file, '.ttf')}.woff2`;
  await writeFile(join(FONT_DIR, out), woff2);

  before += ttf.length;
  after += woff2.length;
  const saved = Math.round((1 - woff2.length / ttf.length) * 100);
  console.log(`${file} → ${out}  ${kb(ttf.length)} → ${kb(woff2.length)}  (−${saved}%)`);
}

console.log(`\ntotal ${kb(before)} → ${kb(after)}  (−${Math.round((1 - after / before) * 100)}%)`);

function kb(bytes) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}
