var express = require('express');
var router = express.Router();
var passport = require('passport');
var Review = require("./../models/reviews");
var Post = require("./../models/blog");
var User = require("./../models/user");

/* GET home page. */
router.get('/', function(req, res, next) {
  Review.find({}).exec(function(err, reviews) {
    if (err) {
      console.log("db error in GET /reviews: " + err);
      res.render('error');
    } else {
      console.log(req.user)
      res.render('index', {reviews: reviews, user: req.user});
    };
  });
});
router.post('/', function(req, res, next){
  new Review({author: req.body.author, body: req.body.body, stars: parseFloat(req.body.stars), email: req.body.email})
  .save(function(err, review){
    res.send(review)
  })
})
router.get('/login', function(req, res, next){
  res.render('login', {user: req.user})
})
router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    console.log(req.body)
    User.register(new User({ name: req.body.name, username: req.body.username }), req.body.password, function(err, user) {
        if (err) {
            return res.render('register', { user : user });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.get('/blog', function(req, res, next){
  Post.find({}).sort({date: 'desc'}).exec(function(err, posts){
    if (err) {
      console.log("db error in GET /blog: " + err);
      res.render('error');
    } else {
      res.render('blog', {posts: posts, user: req.user});
    };
  })
})

router.post('/blog', function(req, res, next){
  tagsArray = req.body.tags.split(', ');
  new Post({title: req.body.title, body: req.body.body, date: new Date(), tags: tagsArray})
    .save(function(err, post){
    res.send(post)
  })
})


module.exports = router;
