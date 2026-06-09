const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const faceController = require('../controllers/faceController');

const router = express.Router();

// Detect faces in uploaded image
router.post('/detect-image', upload.single('image'), faceController.detectFacesInImage);

// Check if models are loaded
router.get('/models', faceController.checkModels);

// Delete uploaded image
router.delete('/image/:fileName', faceController.deleteImage);

// Training endpoints
router.post('/train', faceController.trainModel);
router.post('/recognize', faceController.recognizeFaces);
router.get('/trained-faces', faceController.getTrainedFaces);
router.post('/clear-model', faceController.clearModel);

module.exports = router;
