const config = require('../config/config');
const auth = require('../middleware/authMiddleware')
const {
    getAllCourse, getSingleCourse, searchData, AddCourse, updateCourse, deleteCourse
} = require('../controllers/coursesController');

const express = config.express;
const functions = config.functions;
const router = config.express();


router.get('/allCourse', getAllCourse);
router.get('/singleCourse/:id', getSingleCourse);
router.get('/searchData', searchData);

const userApp = router.use(auth);

userApp.post('/add', AddCourse);
userApp.put('/edit/:id', updateCourse);
userApp.delete('/delete/:id', deleteCourse);

exports.courses = functions.https.onRequest(router);