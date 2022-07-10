const User = require('../models/user');

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

    // create event

    // view individual event

    // index events

    // edit event

    // delete event


}