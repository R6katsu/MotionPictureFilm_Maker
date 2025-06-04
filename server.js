const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const GIFEncoder = require('gifencoder');
const { createCanvas, loadImage } = require('canvas');

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const gifDir = path.join(__dirname, 'gifs');
if (!fs.existsSync(gifDir)) {
  fs.mkdirSync(gifDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

app.use(express.static(__dirname));

app.post('/upload', upload.array('images'), (req, res) => {
  const files = req.files.map(f => path.join('uploads', f.filename));
  res.json({ message: 'Upload successful', files });
});

app.post('/gif', express.json(), async (req, res) => {
  const files = req.body.files || [];
  if (!Array.isArray(files) || files.length === 0) {
    return res.status(400).json({ error: 'No files provided' });
  }

  const width = 1280;
  const height = 720;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const encoder = new GIFEncoder(width, height);
  const gifPath = path.join(gifDir, Date.now() + '.gif');
  const stream = fs.createWriteStream(gifPath);
  encoder.createReadStream().pipe(stream);
  encoder.start();
  encoder.setRepeat(0);
  encoder.setDelay(500);
  encoder.setQuality(10);

  for (const file of files) {
    try {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);
      const img = await loadImage(path.join(__dirname, file));
      const ratio = Math.min(width / img.width, height / img.height);
      const iw = img.width * ratio;
      const ih = img.height * ratio;
      const ix = (width - iw) / 2;
      const iy = (height - ih) / 2;
      ctx.drawImage(img, ix, iy, iw, ih);
      encoder.addFrame(ctx);
    } catch (err) {
      console.error(err);
    }
  }
  encoder.finish();
  stream.on('finish', () => {
    res.download(gifPath, 'film.gif', err => {
      fs.unlink(gifPath, () => {});
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
