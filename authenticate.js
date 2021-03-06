var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('./models/user');
var config = require('./config');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser((User.serializeUser()));
passport.deserializeUser((User.deserializeUser()));


exports.facebook = passport.use(new FacebookStrategy({
    clientID: config.facebook.clientID,
    clientSecret: config.facebook.clientSecret,
    callbackURL: config.facebook.callbackURL,
    profileFields: config.facebook.profileFields

    },
    function (accessToken, refreshToken, profile, done) {
        User.findOne({OauthId: profile.id}, function (err, user) {
            if(err) {
                console.log(err);
            }
            if (!err && user !== null){
                done(null, user);
            }else{
                   console.log (profile);

                user = new User({
                    username: profile.displayName,
                    emails: profile.emails[0].value,
                    picture: profile.photos ? profile.photos[0].value : '/img/faces/unknown-user-pic.jpg'
                } );
                user.OauthId = profile.id;
                user.OauthToken = accessToken;
                user.save(function (err) {
                    if (err){
                        console.log(err);
                    }else{
                        console.log('saving user');
                        done(null, user);
                    }
                });
            }
        });
    }
));