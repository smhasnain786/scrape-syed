const express = require("express");
const multer = require('multer');

const { scrapeLogic } = require("./scrapeLogic");
const path = require('path');
const app = express();
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the directory where you want to store the uploaded images
    cb(null, './uploaded_images');
  },
  filename: function (req, file, cb) {
    // Rename the file if needed; you can adjust the naming logic here
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

// Endpoint to handle image uploads
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  // If the file is uploaded successfully, send a success message
  res.send('File uploaded successfully.');
});

app.use('/images', express.static(path.join(__dirname, 'uploads1')));
const PORT = process.env.PORT || 4000;
console.log(path.join(__dirname, ''));
app.get("/scrape", (req, res) => {
  scrapeLogic(res);
});

app.get("/", (req, res) => {
  res.send("Render Puppeteer server is up and running!");
});
app.get("/img", (req, res) => {
  res.sendFile(path.join(__dirname, 'uploads1', 'screenshot.png'))
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});