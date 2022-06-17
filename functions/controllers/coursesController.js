const student = require('../models/modelCourse');
const request = require('request');
const db = require('../config/config');

const entityRef = db.collection('courses');


const getAllCourse = async (req, res) => {
    const snapshot = await entityRef.get();

    let students = [];
    snapshot.forEach(element => {
        let id = element.id;
        let data = element.data();

        students.push({id, ...data});
    });

    res.status(200).send(JSON.stringify(students));
}

const getSingleCourse = async (req, res) => {
    const snapshot = await entityRef.doc(req.params.id).get();

    const userId = snapshot.id;
    const userData = snapshot.data();

    res.status(200).send(JSON.stringify({id: userId, ...userData}));
}

const AddCourse = async (req, res) => {
    const collection = req.body;
    
    await entityRef.add(collection).then(
        docRef => {
            var url_elasticsearch = 'http://localhost:9200/courses/_doc/';
            var url = url_elasticsearch.concat(String(docRef.id))
            request.put(url,
                    { json: collection },
                    function (error, response, body) {
                        if (!error) {
                            res.json({
                                code: 201,
                                message: "Student Saved.", 
                                result: collection,
                                id: docRef.id,
                                url : url
                            });
                            res.status(201).send;
                        } else {
                            res.json({
                                code: 400,
                                message: "eror when save to elasaticsearch.", 
                                result: false,
                                id: docRef.id,
                                result: collection,
                                url : url
                            });
                            res.status(400).send;
                        }
                    }
            );
        }
    );
}

const updateCourse = async (req, res) => {
    const body = req.body;

    await entityRef.doc(req.params.id).update({...body});
    res.status(200).send();
}

const deleteCourse = async (req, res) => {
    await entityRef.doc(req.params.id).delete();

    res.status(200).send();
}

module.exports = {
    getAllCourse, getSingleCourse, AddCourse, updateCourse, deleteCourse
}
