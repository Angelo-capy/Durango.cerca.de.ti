const express = require('express');
const router = express.Router();
const { upload, handleUpload, handleError } = require('../controllers/upload.controller');

router.post('/', upload.single('imagen'), handleUpload, handleError);

// Captura errores del middleware multer
router.use(handleError);

module.exports = router;
