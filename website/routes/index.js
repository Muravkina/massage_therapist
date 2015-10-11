var express = require('express');
var router = express.Router();
var Review = require("./../models/reviews");
var Blog = require("./../models/blog");
var User = require("./../models/user");

/* GET home page. */
router.get('/', function(req, res, next) {
  Review.find({}).exec(function(err, reviews) {
    if (err) {
      console.log("db error in GET /posts: " + err);
      res.render('error');
    } else {
      res.render('index', {reviews: reviews});
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
  res.render('login', {})
})


module.exports = router;
