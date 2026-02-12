import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public', 'images', 'team');

console.log('🖼️  Optimisation des nouvelles photos d\'équipe...\n');

const images = ['team-1', 'team-2', 'team-3'];

for (const image of images) {
  const inputPath = join(publicDir, `${image}-temp.jpg`);
  const outputPath = join(publicDir, `${image}.jpg`);

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

    console.log(`✅ ${image}.jpg optimisé`);
  } catch (error) {
    console.error(`❌ Erreur avec ${image}:`, error.message);
  }
}

console.log('\n✨ Optimisation terminée!');
