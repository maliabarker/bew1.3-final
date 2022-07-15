// MODELS
const User = require('../models/user');
const Event = require('../models/event')

const multer  = require('multer');
const upload = multer({ dest: 'uploads/' });
const Upload = require('s3-uploader');
const { redis } = require('googleapis/build/src/apis/redis');

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


function clearUsers() {
    User.deleteMany({}).then(function(){
        console.log('deleted users')
    })
}

function clearEvents() {
    Event.deleteMany({}).then(function(){
        console.log('deleted users')
    })
}

module.exports = function(app) {

    // home page
    app.get('/', async (req, res) => {
        if (req.user) {
            try {
                const currentUser = await req.user;
                const userId = req.user._id;
                User.findById(userId).then((user) => {
                    onFeed = user.friends
                    onFeed.push(user)
                    // console.log(onFeed)
                    // TODO: populate createdBy attribute for posts
                    Event.find({'createdBy': { $in : onFeed }}).populate('createdBy').lean().then((events) => {
                        // console.log(events)
                        return res.render('home', { currentUser, user, events });
                    }).catch((err) => {
                        console.log(err.message);
                    });
                }).catch((err) => {
                    console.log(err.message);
                });
            } catch (err) {
                console.log(err.message);
            };
        } else {
            try { 
                return res.render('home');
            } catch (err) {
                console.log(err.message);
            };
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
        currentUser = req.user
        Event.findById(req.params.id).lean().exec((err, event) => {
            // console.log(event)
            res.render('events-show', { event, currentUser });
        });
    });

    // edit event

    // delete event

    // SEARCH
    app.get('/search', function (req, res) {
        currentUser = req.user;
        term = new RegExp(req.query.term, 'i')

        User.find({'username': term}).lean().exec((err, users) => {
            console.log(users)
            res.render('search', { searchTerm : req.query.term, users, currentUser });   
        });

        // User.find(
        //         { $text : { $search : req.query.term } },
        //         { score : { $meta: "textScore" } }
        //     )
        //     .sort({ score : { $meta : 'textScore' } })
        //     .limit(20)
        //     .exec(function(err, users) {
        //         if (err) { return res.status(400).send(err.message) }
        //         console.log(users)
        //         if (req.header('Content-Type') == 'application/json') {
        //             console.log('success')
        //             return res.json({ users: users });
        //         } else {
        //             console.log('no success')
        //             return res.redirect('/');
        //         };
        //     });
    });


}