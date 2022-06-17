const express = require('express');
const functions = require("firebase-functions");

const {
    getAllCourse, getSingleCourse, AddCourse, updateCourse, deleteCourse
} = require('../controllers/coursesController');

const router = express();

router.get('/allCourse', getAllCourse);
router.get('/singleCourse/:id', getSingleCourse);
router.post('/add', AddCourse);
router.put('/edit/:id', updateCourse);
router.delete('/delete/:id', deleteCourse);

exports.courses = functions.https.onRequest(router);