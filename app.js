require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs.engine({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.set('views', './views');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// public folder (static and ajax)
app.use(express.static('public'));

// Set db
require('./data/db');

// requiring the check auth function/middleware
const checkAuth = require('./middleware/checkAuth');
app.use(checkAuth);

app.get('/', (req, res) => {
    res.render('home');
})

app.listen(3000);

module.exports = app;