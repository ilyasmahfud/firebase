const student = require('../models/modelCourse');
const config = require('../config/config');
const moment = require('moment')

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

// judul, deskripsi, imageUrl, createdAt, publishedAt, category, tags 
const AddCourse = async (req, res) => {
    var collection = req.body;
    collection.createdAt = dateNow;
    
    await entityRef.add(collection).then(
        docRef => {
            var url_elasticsearch = process.env.URL_ELASTIC + 'elearning/_doc/';
            var url = url_elasticsearch.concat(String(docRef.id))
            request.put(url,
                {
                    json: collection, 
                    headers : { 
                        'Authorization' : 'ApiKey ' + process.env.ELASTIC_API_KEY
                    } 
                },
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
                            error : error,
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

            var url_elasticsearch = process.env.URL_ELASTIC + 'elearning/_doc/';
            var url = url_elasticsearch.concat(String(req.params.id))
            request.put(url,
                {
                    json: updatedData, 
                    headers : { 
                        'Authorization' : 'ApiKey ' + process.env.ELASTIC_API_KEY
                    } 
                },
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
            var url_elasticsearch = process.env.URL_ELASTIC + 'elearning/_doc/';
            var url = url_elasticsearch.concat(String(req.params.id))
            request.delete(url,
                {
                    headers : { 
                        'Authorization' : 'ApiKey ' + process.env.ELASTIC_API_KEY
                    } 
                },
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


const searchData = async (req, res) => {
    const keyword = req.query.keyword;
    const category = req.query.category;

    // filter berdasar kategori
    if (category != undefined) {
        var data = {
            query : {
                bool : {
                    must : {
                        match : {
                            category : category
                        }
                    },
                    should : [
                        {
                            match : {
                                name : keyword
                            }
                        },
                        {
                            match : {
                                deskripsi : keyword
                            }
                        },
                    ]
                }
            }
        }
    // searching berdsarkan judul dan deskripsi
    } else {
        var data = {
            query : {
                bool : {
                    should : [
                        {
                            match : {
                                name : keyword
                            }
                        },
                        {
                            match : {
                                deskripsi : keyword
                            }
                        },
                    ]
                }
            }
        }
    }

    var url_elasticsearch = process.env.URL_ELASTIC + 'elearning/_search/';
    await request.get(url_elasticsearch,
        {
            json : data,
            headers : { 
                'Authorization' : 'ApiKey ' + process.env.ELASTIC_API_KEY
            } 
        },
        function (error, response, body) {
            if (body.hits.total.value == 0 || body.empty) {
                return res.status(201).json({
                    code: 201,
                    message: "not found.", 
                    result: false,
                });
            } else {
                var resultArray = [];
                
                body.hits.hits.forEach(element => {
                    resultArray.push(element._source);
                });

                return res.status(200).json({
                    code: 200,
                    message: "data found", 
                    results: resultArray,
                    // result: body.hits.hits,
                });
            }
        }
    );
}

const sortData = async (req, res) => {
    const sort_by = req.query.sort_by;
    const order_by = req.query.order_by;

    if (sort_by == 'name') {
        var data = {
            query : {
                match_all : {}
            },
            sort : [{
                'name.keyword' : {
                    order : order_by,
                    // format: "keyword"
                    // format: "strict_date_optional_time_nanos"
                }}
            ]
        }
    } else {
        var data = {
            query : {
                match_all : {}
            },
            sort : [{
                'createdAt.keyword' : {
                    order : order_by,
                    // format: "keyword"
                    // format: "strict_date_optional_time_nanos"
                }}
            ]
        }
    }

    var url_elasticsearch = process.env.URL_ELASTIC + 'elearning/_search/';
    await request.post(url_elasticsearch,
        {
            json : data,
            headers : { 
                'Authorization' : 'ApiKey ' + process.env.ELASTIC_API_KEY
            } 
        },
        function (error, response, body) {
            if (body.status == 400) {
                return res.status(201).json({
                    code: 201,
                    message: body.error, 
                    result: false,
                });
            } else {
                var resultArray = [];
                
                body.hits.hits.forEach(element => {
                    resultArray.push(element._source);
                });

                return res.status(200).json({
                    code: 200,
                    message: "data found", 
                    results: resultArray,
                    // result: body.hits.hits,
                });
            }
        }
    );
}



module.exports = {
    getAllCourse, getSingleCourse, 
    searchData, sortData,
    AddCourse, updateCourse, deleteCourse
}
