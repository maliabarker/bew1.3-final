// MODELS
const User = require('../models/user');
const Event = require('../models/event')

const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');

const client = new Upload(process.env.S3_BUCKET, {
  aws: {
    path: 'events/photo',
    region: process.env.S3_REGION,
    // acl: 'public-read',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  cleanup: {
    versions: true,
    original: true
  },
  versions: [{
    maxWidth: 400,
    aspect: '16:10',
    suffix: '-standard'
  },{
    maxWidth: 300,
    aspect: '1:1',
    suffix: '-square'
  }]
});

module.exports = function(app) {
    // home page
    app.get('/', async (req, res) => {
        try {
            const currentUser = await req.user;
            // console.log(currentUser);
            return res.render('home', { currentUser });

        } catch (err) {
            console.log(err.message);
        };
    });

    // new event
    app.get('/events/new', (req, res) => {
        if (req.user) {
            const currentUser = req.user;
            res.render('events-new', { currentUser });
        } else {
            console.log('unauthorized');
            res.render('error', { errorMessage:'You need to be logged in to see this page.' });
            return res.status(401); // UNAUTHORIZED
        };
    });

    // CREATE PET
    app.post('/events', upload.single('photo'), (req, res, next) => {
        if (req.user) {
            const currentUser = req.user;
            var event = new Event(req.body);
            console.log(event)
            event.save(function (err) {
                if (req.file) {
                    console.log(req.file)
                    // Upload the images
                    client.upload(req.file.path, {}, function (err, versions, meta) {
                        if (err) { 
                            console.log(err.message)
                            return res.status(400).send({ err: err.message }) 
                        };

                        // Pop off the -square and -standard and just use the one URL to grab the image
                        versions.forEach(function (image) {
                            var urlArray = image.url.split('-');
                            console.log(urlArray)
                            console.log('————————————————')
                            urlArray.pop();
                            var url = urlArray.join('-');
                            console.log(url)
                            console.log('————————————————')
                            event.photoUrl = url;
                        });
                        event.createdBy = currentUser
                        event.save();
                        console.log(event)
                        res.send({ event: event });
                    });
                } else {
                    res.send({ event: event });
                }
            })
        } else {
            console.log('unauthorized');
            res.render('error', { errorMessage:'You need to be logged in to see this page.' });
            return res.status(401); // UNAUTHORIZED
        };
    });

    // view individual event
    app.get('/events/:id', (req, res) => {
        Event.findById(req.params.id).exec((err, event) => {
            console.log(event)
            res.render('events-show', { event: event });
        });
    });

    // index events

    // edit event

    // delete event


}