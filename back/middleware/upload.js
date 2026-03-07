const multer = require('multer');

// Stockage en mémoire
const storage = multer.memoryStorage();

// Filtre pour accepter seulement Excel
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    file.mimetype === 'application/vnd.ms-excel'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Seuls les fichiers Excel sont autorisés'), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;