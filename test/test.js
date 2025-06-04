const { createCanvas } = require('canvas');
const { execSync } = require('child_process');
const fs = require('fs');

function createImage(path, color) {
  const canvas = createCanvas(50, 50);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 50, 50);
  fs.writeFileSync(path, canvas.toBuffer('image/png'));
}

function main() {
  createImage('img1.png', 'red');
  createImage('img2.png', 'blue');
  execSync('node makegif.js test.gif img1.png img2.png', { stdio: 'inherit' });
  if (!fs.existsSync('test.gif')) {
    throw new Error('GIF not generated');
  }
  console.log('GIF generated successfully');
}

main();
