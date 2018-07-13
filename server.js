const express   = require("express"),
    app         = express(),
    db          = require("./db"),
    multer      = require('multer'),
    uidSafe     = require('uid-safe'),
    path        = require('path'),
    config      = require('./config'),
    bodyParser = require('body-parser');

app.use(bodyParser.json());

const s3 = require('./s3');

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 20971520
    }
});

app.use(require("body-parser").urlencoded({
    extended: false
}));

app.use(express.static("./public"));
app.use(express.static("./uploads"));

app.post('/upload',uploader.single('file'), s3.upload, (req, res) => {
    db.saveImage(
        req.body.title,
        req.body.description,
        req.body.username,
        config.s3Url + req.file.filename
    ).then(function(result) {
        res.json({
            image: result.rows[0]});
    }).catch(function(err) {
        console.log(err);
    });
    console.log('Image uploaded successfully');
});

app.get("/images", function(req, res) {
    db.getImages()
        .then(function(results) {
            res.json({
                images: results.rows
            });
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.get("/images/:id", (req, res) => {
    db.getImageById(req.params.id).then(function(result) {
        res.json(result.rows[0]);
    });
});

app.post('/images/comment', (req, res) => {
    db.addComment(req.body.comment, req.body.username, req.body.image_id)
        .then(function(result) {
            res.json(result.rows[0]);
        }).catch(function(err) {
            console.log(err);
        });
});

app.get('/comments/:id', (req, res) => {
    db.getComment(req.params.id).then(result => {
        res.json(result.rows);
    }).catch(function(err) {
        console.log(err);
    });
});

app.get("/images/more/:id", function(req, res) {
    db.moreImages(req.params.id)
        .then(function(results) {
            res.json(results.rows);
        })
        .catch(function(err) {
            console.log(err);
        });
});

app.listen(8080, () => console.log(`And so I listen`));
