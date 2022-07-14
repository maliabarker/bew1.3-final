const User = require('../models/user');
const Event = require('../models/event')

function checkIfFriends(currentUser, otherUser) {
    if (currentUser) {
        if (currentUser in otherUser.friends) {
            console.log('Friends!')
            return true
        } else {
            console.log('Not friends')
            return false
        };
    };
};

function checkIfRequested(currentUser, otherUser) {
    if (currentUser) {
        if (currentUser in otherUser.friend_requests) {
            console.log('Requested!')
            return true
        } else {
            console.log('Not requested')
            return false
        };
    };
}

module.exports = function(app) {
    // view profile
    app.get('/users/:username', (req, res) => {
        if (req.user) {
            const currentUser = req.user
            User.findOne({ 'username': req.params.username }).lean().then((thisUser) => {
                var checkFriends = checkIfFriends(currentUser, thisUser);
                var checkRequested = checkIfRequested(currentUser, thisUser);
                console.log(checkFriends)
                console.log(checkRequested)
                res.render('profile', { currentUser, thisUser, checkFriends, checkRequested });
            });
        } else {
            res.render('error', { errorMsg: 'You need to log in to see this' })
        };
    });

    app.get('/users/:username/sendRequest', (req, res) => {
        if (req.user) {
            const currentUser = req.user
            User.findOne({ 'username': req.params.username }).lean().then((thisUser) => {
                thisUser.friend_requests.push(currentUser)
                console.log(thisUser.friend_requests)
                res.redirect('/users/:username', {username: thisUser.username})
            });
        } else {
            res.render('error', { errorMsg: 'You need to log in to see this' })
        };
    });
}