var express = require('express');
var router = express.Router();
var passport = require('passport');
var Review = require("./../models/reviews");
var Blog = require("./../models/blog");
var User = require("./../models/user");
var crypto = require( "crypto" );
var formidable = require('formidable');



router.get('/', function(req, res, next) {
  Review.find({}).sort({"_id":-1}).limit(10).exec(function(err, reviews) {
    if (err) {
      console.log("db error in GET /reviews: " + err);
      res.render('error');
    } else {
      Review.count({}, function(err, count){
        if(err){
          console.log("db error in GET /reviews: " + err);
          res.render('error');
        } else {
          res.render('index', {reviews: reviews, user: req.user, totalReviews: count});
        }
      })
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
  Blog.Post.find({}).limit(10).sort({date: 'desc'}).exec(function(err, posts){
    if (err) {
      console.log("db error in GET /blog: " + err);
      res.render('error');
    } else {
      Blog.Post.count({}, function(err, count){
        Blog.Post.aggregate([
          {$unwind: "$comments"},
          {$group: {_id:"$_id", title: {$first :"$title"}, body: {$first :"$body"}, comments: {$push:"$comments"}, size: {$sum:1}}},
          {$sort:{size:1}}]).exec(function(err, popularPosts){
            popularPosts.reverse();
            ///find all the tags
            var tags = [];
            var uniqueTags = [];
            var getCategories = function(posts){
              posts.forEach(function(post){
                post.tags.forEach(function(tag){
                  tags.push(tag);
                })
              })
              uniqueTags = tags.filter(function(elem, index, self){
                return index == self.indexOf(elem);
              })
            }
            getCategories(posts);
            if (req.query.back) {
              res.send(posts)
            } else {
              res.render('blog', {posts: posts, user: req.user, tags:uniqueTags, totalPosts: count, popularPosts: popularPosts});
            }
        })
      })
    };
  })
})

router.post('/blog', function(req, res){
  var form = new formidable.IncomingForm();
   form.parse(req, function(err, fields, files) {
      tagsArray = fields.tags.replace(" ", "").split(',');
      new Blog.Post({title: fields.title, body: fields.body, date: new Date(), tags: tagsArray}).save(function(err, post){
        post.attach('image', {path: files.image.path}, function(error){
          res.send(post)
        })
      })
    });
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
      post.tags = req.body.tags.split(', ');

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

router.get('/tags/:name', function(req, res){
  Blog.Post.find({tags: { $in: [req.params.name] }}).sort({"_id":-1}).exec(function(err, posts){
    res.send(posts);
  })
})

router.get('/search', function(req, res){
  Blog.Post.find(
    { $text: {$search: req.query.params}}
    ).sort({"_id":-1}).exec(function(err, posts){
    if (err) {
      res.send(err);
    } else {
      res.send(posts);
    }
  })
})

router.get('/olderPosts', function(req, res){
  Blog.Post.find( {_id : { "$lt" : req.query.id } } ).limit(10).sort({"_id":-1}).exec(function(err,posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      res.send(posts)
    }
  });
})

router.get('/newerPosts', function(req, res){
  Blog.Post.find( {_id : { "$gt" : req.query.id } } ).sort({"_id": 1}).limit(10).exec(function(err,posts){
    if (err) {
      console.log("db error in GET /newerPosts: " + err);
      res.render('error');
    } else {
      posts.reverse();
      res.send(posts);
    }
  });
})

router.get('/olderReviews', function(req, res){
  Review.find( {_id : { "$lt" : req.query.id } } ).limit(10).sort({"_id":-1}).exec(function(err, reviews){
    if (err) {
      console.log("db error in GET /olderReviews: " + err);
      res.render('error');
    } else {

      res.send(reviews)
    }
  });
})

router.get('/newerReviews', function(req, res){
  Review.find( {_id : { "$gt" : req.query.id } } ).limit(10).sort({"_id":1}).exec(function(err, reviews){
    if (err) {
      console.log("db error in GET /olderReviews: " + err);
      res.render('error');
    } else {
      reviews.reverse();
      res.send(reviews);
    }
  });
})

router.delete('/reviews/:id', function(req, res){
  Review.findOne({'_id': req.params.id}).remove().exec(function(err){
    if (err) {
      console.log("db error in DELETE /posts: " + err);
      res.render('error');
    } else {
      res.send('success')
    }
  })
})

router.get('/isAuthenticated', function(req, res, next){
  if(req.user){
    res.send(true)
  } else {
    res.send(false)
  }
})


module.exports = router;
