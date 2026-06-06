const express = require('express');
const router = express.Router();
const comerciosController = require('../controllers/comercios.controller');

router.get('/', comerciosController.getAll);
router.get('/:id', comerciosController.getById);
router.post('/', comerciosController.create);
router.put('/:id', comerciosController.update);
router.delete('/:id', comerciosController.delete);

module.exports = router;
