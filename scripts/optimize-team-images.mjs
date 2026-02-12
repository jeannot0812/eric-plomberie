import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public', 'images', 'team');

const images = ['team-1.jpg', 'team-2.jpg', 'team-3.jpg'];

console.log('🖼️  Optimisation des photos d\'équipe...\n');

for (const image of images) {
  const inputPath = join(publicDir, image);
  const outputPath = join(publicDir, image.replace('.jpg', '-optimized.jpg'));

  try {
    await sharp(inputPath)
      .resize(800, 1066, {
        fit: 'cover',
        position: 'center'
      })
      .sharpen({
        sigma: 1.5,
        m1: 1.0,
        m2: 0.7
      })
      .jpeg({
        quality: 92,
        mozjpeg: true
      })
      .toFile(outputPath);

    console.log(`✅ ${image} → ${image.replace('.jpg', '-optimized.jpg')}`);
  } catch (error) {
    console.error(`❌ Erreur avec ${image}:`, error.message);
  }
}

console.log('\n✨ Optimisation terminée!');
