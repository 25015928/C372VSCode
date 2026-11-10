const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const petController = require('../controllers/petController');
const { isLoggedIn } = require('../middleware/auth');

router.get('/new', isLoggedIn, petController.newPetForm);
router.post('/', upload.single('pet_image'), isLoggedIn, petController.createPet);

module.exports = router;
