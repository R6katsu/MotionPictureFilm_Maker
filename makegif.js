const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const GIFEncoder = require('gifencoder');

async function createGif(output, images, options = {}) {
  const width = options.width || 1280;
  const height = options.height || 720;
  const delay = options.delay || 500;

  const encoder = new GIFEncoder(width, height);
  const writeStream = fs.createWriteStream(output);
  encoder.createReadStream().pipe(writeStream);

  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(delay);
  encoder.setQuality(10);

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  for (const file of images) {
    try {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      const img = await loadImage(file);
      const ratio = Math.min(width / img.width, height / img.height);
      const iw = img.width * ratio;
      const ih = img.height * ratio;
      const ix = (width - iw) / 2;
      const iy = (height - ih) / 2;
      ctx.drawImage(img, ix, iy, iw, ih);
      encoder.addFrame(ctx);
    } catch (err) {
      console.error(`Failed to add ${file}:`, err);
    }
  }
  encoder.finish();
  return new Promise(resolve => writeStream.on('finish', resolve));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.log('Usage: node makegif.js output.gif image1 image2 ...');
    process.exit(1);
  }
  const output = args[0];
  const images = args.slice(1);
  await createGif(output, images);
  console.log(`GIF saved to ${output}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
