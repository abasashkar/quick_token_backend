const express = require('express');
const router = express.Router();
const doctorsController = require('../controllers/doctorsController.js');

// Route to get all doctors
router.get('/', doctorsController.getAllDoctors); // <-- change '/doctors' to '/'

module.exports = router;
