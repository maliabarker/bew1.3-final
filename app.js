require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

var exphbs = require('express-handlebars');

// exphbs.registerHelper('dateFormat', require('handlebars-dateformat'));

app.engine('handlebars', exphbs.engine({defaultLayout: 'main', 
                                        helpers: require('./public/js/helpers')}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// public folder (static and ajax)
app.use(express.static('public'));
app.use(express.static("public/css"))
app.use(express.static("public/images"))

// Set db
require('./data/db');

// requiring the check auth function/middleware
const checkAuth = require('./middleware/checkAuth');
app.use(checkAuth);

// require controller routes 
require('./controllers/auth.js')(app)
require('./controllers/events.js')(app)
require('./controllers/calendars.js')(app)
require('./controllers/users.js')(app)

app.listen(3000);

module.exports = app;
 
/*
MVP:
- CRUD event
- add event to favorites
- add event to attending
- add attending events to calendar ?
- create profile
- CRUD friends
- set privacy modes on viewing profiles
*/

/* 
EXTRA:
- add google map api? or something for location
- add the event cart to plan a day
- calendar
*/