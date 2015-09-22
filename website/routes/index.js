var express = require('express');
var router = express.Router();
var Review = require("./../models/reviews");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.post('/', function(req, res, next){
  console.log(req.body)
  new Review({author: req.body.author, body: req.body.body, stars: req.body.stars})
  .save(function(err, review){
    ////// smth here
  })
})

module.exports = router;
