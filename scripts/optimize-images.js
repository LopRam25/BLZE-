#!/usr/bin/env node
/**
 * Batch convert JPG/PNG images in public/uploads to WebP & AVIF with Sharp.
 * Usage: node scripts/optimize-images.js
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const INPUT_DIR = path.join(process.cwd(), 'public', 'uploads');
const OUT_DIR = INPUT_DIR; // overwrite alongside originals

async function convert(file) {
  const inputPath = path.join(INPUT_DIR, file);
  const base = file.replace(/\.(png|jpg|jpeg)$/i, '');
  const img = sharp(inputPath);
  await img.toFormat('webp', { quality: 80 }).toFile(path.join(OUT_DIR, base + '.webp'));
  await img.toFormat('avif', { quality: 60 }).toFile(path.join(OUT_DIR, base + '.avif'));
  console.log('Optimized', file);
}

fs.readdirSync(INPUT_DIR)
  .filter((f) => /\.(png|jpe?g)$/i.test(f))
  .forEach((f) => convert(f));