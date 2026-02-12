import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public', 'images', 'team');

console.log('🖼️  Optimisation de la photo team-3...\n');

const inputPath = join(publicDir, 'team-3-temp.jpg');
const outputPath = join(publicDir, 'team-3.jpg');

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

  console.log('✅ team-3.jpg optimisée avec succès!');
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
