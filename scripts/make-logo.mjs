import sharp from 'sharp';
const src = process.argv[2] ?? 'brand-source/reaper-transparent.png';
const out = 'public/';
for (const s of [96, 192, 512]) await sharp(src).resize(s, s).webp({ quality: 90 }).toFile(`${out}brand/dod-${s}.webp`);
await sharp(src).resize(512, 512).png({ compressionLevel: 9 }).toFile(`${out}brand/dod-512.png`);
await sharp(src).resize(180, 180).png().toFile(`${out}apple-touch-icon.png`);
await sharp(src).resize(48, 48).png().toFile(`${out}favicon-48.png`);
console.log('done');
