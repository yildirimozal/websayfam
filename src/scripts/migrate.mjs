import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Next.js REPL'ini başlat
const proc = spawn('node', [
  '--experimental-repl-await',
  '--loader', 'ts-node/esm',
  '--eval',
  `
  import { createRequire } from 'module';
  const require = createRequire(import.meta.url);
  
  // Next.js ortamını yükle
  const next = require('next');
  const app = next({ dev: true });
  
  async function runMigration() {
    try {
      // Next.js'i hazırla
      await app.prepare();
      
      // Migrasyon scriptini çalıştır
      const { default: migrate } = await import('./src/scripts/migrateBlogSchema.ts');
      await migrate();
      
      console.log('Migrasyon tamamlandı');
      process.exit(0);
    } catch (error) {
      console.error('Migrasyon hatası:', error);
      process.exit(1);
    }
  }
  
  runMigration();
  `
], {
  stdio: 'inherit',
  cwd: process.cwd()
});

proc.on('error', (err) => {
  console.error('Script çalıştırma hatası:', err);
  process.exit(1);
});
