var mongoose = require('mongoose');

const User = require('../models/user');
const Event = require('../models/event')


function checkIfFriends(currentUser, otherUser) {
    if (currentUser) {
        var isInArray = otherUser.friends.some(function (friend) {
            console.log('Friends!')
            return friend.equals(currentUser._id);
        });
        return isInArray
    };
};

function checkIfRequested(currentUser, otherUser) {
    if (currentUser) {
        var isInArray = otherUser.friend_requests.some(function (friend) {
            console.log('Requested!')
            return friend.equals(currentUser._id);
        });
        return isInArray
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
                res.render('profile', { currentUser, thisUser, checkFriends, checkRequested });
            });
        } else {
            res.render('error', { errorMsg: 'You need to log in to see this' })
        };
    });

    app.get('/users/:username/sendRequest', (req, res) => {
        if (req.user) {
            const currentUser = req.user
            User.findOneAndUpdate(
                { username: req.params.username }, 
                { $push: { friend_requests: currentUser  } },
                function (error, success) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.redirect(`/users/${req.params.username}`)
                    }
            });
        } else {
            res.render('error', { errorMsg: 'You need to log in to see this' })
        };
    });
}