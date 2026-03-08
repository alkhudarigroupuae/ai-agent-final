import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

export async function enhanceImageBuffer(imageBuffer) {
  return sharp(imageBuffer).resize(1200, 1200, { fit: 'inside' }).sharpen().toBuffer();
}

export async function saveEnhancedImage(imageBuffer, filename = `enhanced-${Date.now()}.jpg`) {
  const outputDir = path.resolve(process.cwd(), 'tmp');
  await fs.mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, filename);
  await fs.writeFile(outputPath, imageBuffer);
  return outputPath;
}

export function buildImageSearchQueries({ sku, name, brand }) {
  return [
    `${sku} ${name} ${brand} official image`,
    `${name} ${brand} high resolution`,
    `${sku} replacement part`
  ].filter(Boolean);
}
