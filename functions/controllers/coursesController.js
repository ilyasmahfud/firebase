const student = require('../models/modelCourse');
const config = require('../config/config');
const moment = require('moment')
const authMiddleware = require('../middleware/authMiddleware');

var db = config.db;
var request = config.request;

const entityRef = db.collection('courses');
const dateNow = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')

const getAllCourse = async (req, res) => {
    const snapshot = await entityRef.get();
    let courses = [];
    snapshot.forEach(element => {
        let id = element.id;
        let data = element.data();
        courses.push({id, ...data});
    });

    res.json({
        code: 200,
        message: "succefully fetched data",
        data : courses
    });
    res.status(200).send();
}

const getSingleCourse = async (req, res) => {
    const snapshot = await entityRef.doc(req.params.id).get();

    const userId = snapshot.id;
    const userData = snapshot.data();

    return res.status(200).json({
        code: 200,
        message: "succefully fetched data",
        data : {userId, ...userData}
    });
}

const searchData = async (req, res) => {
    const keyword = req.query.keyword;

    await entityRef.where("name",conta)

        const data = Object.entries(snapshot.val());

        var result = [];
        data.forEach(element => {
            if (!(element[1].name.search(keyword))) {
                let id = element[0];
                let data = element[1];

                result.push({id, ...data});
            }
        });
        
        if (result.length == 0) {
            res.json({
                message: "Error: No collection found", 
                result: false
            });
        } else {
            res.json({
                message: "successfully fetch data", 
                result: true, 
                // data: data
                data: result
                // data: snapshot.val()
            });
        }
}

// judul, deskripsi, imageUrl, createdAt, publishedAt, category, tags 
const AddCourse = async (req, res) => {
    var collection = req.body;
    collection.createdAt = dateNow;
    
    await entityRef.add(collection).then(
        docRef => {
            var url_elasticsearch = 'http://localhost:9200/courses/_doc/';
            var url = url_elasticsearch.concat(String(docRef.id))
            request.put(url,
                        { json: collection },
                        function (error, response, body) {
                            if (!error) {
                                return res.status(201).json({
                                    code: 201,
                                    message: "E-Course Saved.", 
                                    result: collection,
                                    id: docRef.id,
                                    url : url
                                });
                            } else {
                                return res.status(400).json({
                                    code: 400,
                                    message: "eror when save to elasaticsearch.", 
                                    result: false,
                                    id: docRef.id,
                                    result: collection,
                                    url : url
                                });
                            }
                        }
            );
        }
    );
}

const updateCourse = async (req, res) => {
    const body = req.body;

    await entityRef.doc(req.params.id).update({...body}).then(
        async docRef => {
            let updatedData = await entityRef.doc(req.params.id).get();

            var url_elasticsearch = 'http://localhost:9200/courses/_doc/';
            var url = url_elasticsearch.concat(String(req.params.id))
            request.put(url,
                        { json: updatedData },
                        function (error, response, body) {
                            if (!error) {
                                return res.status(201).json({
                                    code: 201,
                                    message: "E-Course Updated.", 
                                    id: req.params.id,
                                    result: {...updatedData.data()},
                                    url : url
                                });
                            } else {
                                return res.status(400).json({
                                    code: 400,
                                    message: "eror when update to elasaticsearch.", 
                                    result: false,
                                    id: req.params.id,
                                    result: {...updatedData.data()},
                                    url : url
                                });
                            }
                        }
            );
        }
    );
}

const deleteCourse = async (req, res) => {
    await entityRef.doc(req.params.id).delete().then(
        docRef => {
            var url_elasticsearch = 'http://localhost:9200/courses/_doc/';
            var url = url_elasticsearch.concat(String(req.params.id))
            request.delete(url, 
                function (error, response, body) {
                    if (!error) {
                        res.json({
                            code: 201,
                            message: "E-course Deleted.", 
                            id: req.params.id,
                        });
                        res.status(201).send;
                    } else {
                        res.json({
                            code: 400,
                            message: "eror when delete document in elasaticsearch.", 
                            id: req.params.id,
                        });
                        res.status(400).send;
                    }
                }
            );
        }
    );
}

module.exports = {
    getAllCourse, getSingleCourse, searchData, AddCourse, updateCourse, deleteCourse
}
