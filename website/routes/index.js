var express = require('express');
var router = express.Router();
var passport = require('passport');
var Review = require("./../models/reviews");
var Blog = require("./../models/blog");
var User = require("./../models/user");


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

router.get('/blog', function(req, res){
  Blog.Post.find({}).sort({date: 'desc'}).exec(function(err, posts){
    if (err) {
      console.log("db error in GET /blog: " + err);
      res.render('error');
    } else {
      res.render('blog', {posts: posts, user: req.user});
    };
  })
})

router.post('/blog', function(req, res){
  req.body.tags = req.body.tags.split(",").map(function(tag) {
    return { "name": tag };
  });
  new Blog.Post(req.body).save(function(err, post){
    res.send(post)
  })
})

router.delete('/posts/:id', function(req, res){
  Blog.Post.findOne({'_id': req.params.id}).remove().exec(function(err){
    if (err) {
      console.log("db error in DELETE /posts: " + err);
      res.render('error');
    } else {
      res.send('success')
    }
  })
})

router.put('/posts/:id', function(req, res){
  Blog.Post.findById(req.params.id, function(err, post){
    if (err) {
      res.send(err);
    } else {
      post.title = req.body.title;
      post.body = req.body.body;

      req.body.tags = req.body.tags.split(",").map(function(tag) {
        return { "name": tag };
      });
      post.tags = req.body.tags;

      post.save(function(err){
        if(err){
          res.send(err)
        } else {
          res.send(post)
        }
      })
    }
  })
})

router.get('/posts/:id', function(req, res){
  Blog.Post.findById(req.params.id, function(err, post){
    if (err) {
      res.send(err)
    } else {

      res.render('post', {post: post, user: req.user})
    }
  })
})

router.post('/posts/:id/comments', function(req, res){
  Blog.Post.findById(req.params.id, function(err, post){
    if(err) {
      res.send(err)
    } else {

      var newComment = new Blog.Comment();
      newComment.date = new Date();
      newComment.title = req.body.title;
      newComment.body = req.body.body;
      newComment.name = req.body.name;
      newComment.email = req.body.email;
      newComment.website = req.body.website;
      post.comments.unshift(newComment)

      post.save(function(err){
        if (err) {
          res.send(err)
        } else {
          res.send({comment: newComment, user: req.user})
        }
      })
    }
  })
})

router.delete('/posts/:postId/comments/:commentId', function(req, res){
  Blog.Post.findById(req.params.postId, function(err, post){
    post.comments.id(req.params.commentId).remove();
    post.save(function(err){
      if (err) {
        res.send(err)
      } else {
        res.send('success')
      }
    })
  })
})


module.exports = router;
