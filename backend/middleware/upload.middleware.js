const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage(); // Store in memory for parsing

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

module.exports = upload;