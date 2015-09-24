var express = require('express');
var router = express.Router();
var Review = require("./../models/reviews");

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
    console.log(review)
    res.send(review)
  })
})

module.exports = router;
