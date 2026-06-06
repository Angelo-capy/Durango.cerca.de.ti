const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const TAMANO_MAX = 5 * 1024 * 1024; // 5MB (RNF-10)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const nombre = crypto.randomBytes(16).toString('hex') + ext;
    cb(null, nombre);
  },
});

const fileFilter = (req, file, cb) => {
  if (!TIPOS_PERMITIDOS.includes(file.mimetype)) {
    return cb(new Error('Solo se permiten imágenes JPG, PNG, WEBP o GIF.'));
  }
  cb(null, true);
};

exports.upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: TAMANO_MAX },
});

exports.handleUpload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envió ningún archivo.' });
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ url });
};

exports.handleError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'La imagen no puede pesar más de 5MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};
