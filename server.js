const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
