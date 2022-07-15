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

    app.get('/users/:username/send-request', (req, res) => {
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

    app.get('/users/:username/view-requests', (req, res) => {
        if(req.user) {
            currentUser = req.user
            console.log(currentUser)
            User.findOne({'username':req.params.username}).populate('friend_requests').lean().then((thisUser) => {
                if(currentUser._id == thisUser._id){
                    var requests = thisUser.friend_requests
                    // console.log(thisUser.username)
                    // console.log(requests)
                    res.render('view-requests', { currentUser, thisUser, requests});
                } else {
                    res.render('error', { errorMsg: 'You can\'t access this' })
                }
            });
        } else {
            res.render('error', { errorMsg: 'You need to log in to see this' })
        }
    });

    app.get('/users/:username/accept-request/:requestId', (req, res) => {
        if(req.user){
            console.log(req.params.username)
            console.log(req.params.requestId)
            // remove request from friend requests and add to friends for BOTH users
            User.findOneAndUpdate(
                { username: req.params.username }, 
                { $pull: { friend_requests: req.params.requestId  } },
                function (error, success) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(success)
                    }
            });
            User.findOneAndUpdate(
                { username: req.params.username }, 
                { $push: { friends : req.params.requestId } },
                function (error, success) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(success)
                    }
            });
            User.findOneAndUpdate(
                { id: req.params.requestId }, 
                { $push: { friends : req.user._id } },
                function (error, success) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log(success)
                        res.redirect(`/users/${req.params.username}/view-requests`)
                    }
            });
        }
    })

    app.get('/users/:username/decline-request/:requestId', (req, res) => {
        if(req.user){
            console.log(req.params.username)
            console.log(req.params.requestId)
            
            // remove request from friend requests
            User.findOneAndUpdate(
                { username: req.params.username }, 
                { $pull: { friend_requests: req.params.requestId  } },
                function (error, success) {
                    if (error) {
                        console.log(error);
                    } else {
                        res.redirect(`/users/${req.params.username}/view-requests`)
                    }
            });
        }
    })
}