const functions = require("firebase-functions");
const express = require('express');
const cors = require('cors');
const request = require('request');

const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const authMiddleware = require('../middleware/authMiddleware');
const { app } = require("firebase-admin");

const userApp = express();
// apply auth for all endpoint
// userApp.use(authMiddleware);

// use the auth for specific endpoint
// userApp.get('/', authMiddleware,async (req, res) => {
userApp.get('/', async (req, res) => {
    const snapshot = await db.collection('nama_barang').get();

    let nama_barang = [];
    snapshot.forEach(element => {
        let id = element.id;
        let data = element.data();

        nama_barang.push({id, ...data});
    });

    res.status(200).send(JSON.stringify(nama_barang));
})

userApp.get('/:id', async (req, res) => {
    const snapshot = await db.collection('nama_barang').doc(req.params.id).get();

    const userId = snapshot.id;
    const userData = snapshot.data();

    res.status(200).send(JSON.stringify({id: userId, ...userData}));
})

userApp.post('/', async (req, res) => {
    const collection = req.body;
    
    await db.collection('nama_barang').add(collection).then(
        docRef => {
            var url_elasticsearch = 'http://localhost:9200/learn_elasticesearch/_doc/';
            var url = url_elasticsearch.concat(String(docRef.id))
            request.put(url,
                    { json: collection },
                    function (error, response, body) {
                        if (!error) {
                            res.json({
                                code: 201,
                                message: "Collectin Saved.", 
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

})

userApp.put('/:id', async (req, res) => {
    const body = req.body;

    await db.collection('nama_barang').doc(req.params.id).update({...body});
    res.status(200).send();
})

userApp.delete('/:id', async (req, res) => {
    await db.collection('nama_barang').doc(req.params.id).delete();

    res.status(200).send();
})


const rtd = admin.database()
const collectionRef = rtd.ref("colection")

userApp.post('/api/createCollection', async (req, res) => {
    var data = req.body;

    await collectionRef.push(data, function(err) {
        if (err) {
            res.send(err)
        } else {
            res.json({
                code: 200,
                message: "Collectin Saved.", 
                result: true
            });
        }
    });
 
});

// get users   
userApp.get('/api/getCollection', async (req, res) => {

    await collectionRef.once("value", function(snapshot) {
        if (snapshot.val() == null) {
            res.json({
                message: "Error: No collection found", 
                result: false
            });
        } else {
            res.json({
                message: "successfully fetch data", 
                result: true, 
                data: snapshot.val()
            });
        }
    });

});

userApp.get('/api/searchCollection', async (req, res) => {
    const keyword = req.query.keyword;

    await collectionRef.once("value", function(snapshot) {

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
    });

});


userApp.get('/api/getCollection/:id', async (req, res) => {

    collectionRef.child(req.params.id).once("value", function(snapshot) {
        if (snapshot.val() == null) {
            res.json({
                message: "Error: No user found", 
                result: false
            });
        } else {
            res.json({
                message: "successfully fetch data", 
                result: true, 
                data: snapshot.val()
            });
        }
    });

});


// update user
userApp.put('/api/updateCollection/:id', async (req, res) => {

    // var uid = "-Ks8HilZxX5vtFPqGu75";
    const data = req.body;

    await collectionRef.child(req.params.id).update(data, function(err) {
        if (err) {
            res.send(err);
        } else {
            collectionRef.child(req.params.id).once("value", function(snapshot) {
                if (snapshot.val() == null) {
                    res.json({
                        message: "Error: No Collection found", 
                        result: false,
                        data: snapshot.val()
                    });
                } else {
                    res.json({
                        message:"successfully update data", 
                        result: true, 
                        data: snapshot.val()
                    });
                }
            });
        }
    });

});

// delete user
userApp.delete('/api/removeCollection/:id', async (req, res) => {

    // var uid = "-Ks8HilZxX5vtFPqGu75";
    await collectionRef.child(req.params.id).remove(function(err) {
        if (err) {
            res.send(err);
        } else {
            res.json({
                message: "Success: Collection deleted.", 
                result: true
            });
        }
    })

});

exports.user = functions.https.onRequest(userApp);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
