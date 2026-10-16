/** Gera o apple-touch-icon (180×180) a partir de public/favicon.svg. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const svg = await readFile(path.join(raiz, 'public', 'favicon.svg'));
await sharp(svg, { density: 384 })
  .resize(180, 180)
  .png()
  .toFile(path.join(raiz, 'public', 'apple-touch-icon.png'));
console.log('icones: apple-touch-icon.png gerado');
