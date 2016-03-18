var express = require('express');
var router = express.Router();
var passport = require('passport');
var Review = require("./../models/reviews");
var Blog = require("./../models/blog");
var User = require("./../models/user");
var crypto = require( "crypto" );
var formidable = require('formidable');
var S3 = require("../config");
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');
var EmailTemplate = require('email-templates').EmailTemplate;
var path = require('path');
var async = require('async');
var templatesDir = path.resolve(__dirname, '..', 'templates');
var template = new EmailTemplate(path.join(templatesDir, 'newpost'));
var helpers = require("./../models/email");
var form = new formidable.IncomingForm();

//emailer
var options = {
    auth: {
        api_key: process.env.SG_PASSWORD
    }
};

var mailer = nodemailer.createTransport(sgTransport(options));

//Amazon S3 configuration
var knox = require('knox').createClient({
    key: S3.S3_KEY,
    secret: S3.S3_SECRET,
    bucket: S3.S3_BUCKET
});

// send email with the email template
var sendEmails = function(post){
  Blog.EmailList.find({}).exec(function(err, emails){
    if(err){res.send(err)}
    else {
      async.each(emails, function(email, next){
        template.render(post, function(err, results){
          if(err){console.log(err)}
          else {
            mailer.sendMail({
              attachments: [{
                  filename: 'gotmail.jpg',
                  path: __dirname + '/../public/images/gotmail.jpg',
                  cid: 'gotmail' //same cid value as in the html img src
              }],
              from: 'Ilia Gerassimov <massagebygerill@gmail.com>',
              to: email.email,
              subject: 'New Post by Ilia Gerassimov',
              html: results.html
            }, function(err, responseStatus){
              if(err){console.log(err)}
              console.log(responseStatus)
            })
          }
        })
      })
    }
  })
}


router.get('/', function(req, res, next) {
  async.parallel({
    reviews: function(cb){Review.findTenReviews(cb)},
    count: function(cb){Review.count(cb)}
  }, function(err, results){
    if(err){console.log(err)}
    else {
      res.render('index', {reviews: results.reviews, user: req.user, totalReviews: results.count});
    }
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

router.post('/login', passport.authenticate('local',{ successRedirect: '/blog',
                                   failureRedirect: '/login'}
));

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
  async.parallel({
    posts: function(cb){Blog.Post.findFirstTenPosts(cb)},
    count: function(cb){Blog.Post.count(cb)},
    uniqueTags: function(cb){Blog.Post.findUniqueTags(cb)},
    popularPosts: function(cb){Blog.Post.findPopularPosts(cb)}
    }, function(err, results){
      if(err){console.log(err)}
       res.render('blog', {url: req.path.split('/')[1], posts: results.posts, user: req.user, tags:results.uniqueTags, totalPosts: results.count, popularPosts: results.popularPosts});
    })
})

router.get('/back', function(req, res){
  Blog.Post.findFirstTenPosts(function(err, posts){
      res.send({posts: posts, user: req.user})
  })
})

router.post('/blog', function(req, res){
  form.parse(req, function(err, fields, files) {
    new Blog.Post({title: fields.title, body: fields.body, date: new Date(), tags: fields.tags})
      .save(files)
      .then(function(post){
        sendEmails(post);
        Blog.Post.findFirstTenPosts(function(err, posts){
          res.send({posts: posts, post: post});
        })
      })
  });
});


router.delete('/posts/:id', function(req, res){
  async.waterfall([
    function(cb){Blog.Post.deletePost(req.params.id, cb)},
    function(cb){Blog.Post.findThisPagePosts(req.body.firstPostId, cb)}
    ], function(err, results){
      res.send({posts: results, id: req.params.id})
  })
})

router.put('/posts/:id', function(req, res){
  async.waterfall([
    function(cb){form.parse(req, cb)},
    function(fields, files, cb){Blog.Post.updatePost(req.params.id, fields, files, cb)}
    ], function(err, result){
      if(err) {console.log(err)}
        res.send(result)
  })
})

router.get('/posts/:id', function(req, res){
  async.parallel({
    popularPosts: function(cb){Blog.Post.findPopularPosts(cb)},
    uniqueTags: function(cb){Blog.Post.findUniqueTags(cb)},
    count: function(cb){Blog.Post.count(cb)},
    post: function(cb){Blog.Post.findById(req.params.id, cb)}
  }, function(err, results){
    Blog.Post.findRelatedPosts(results.post.tags, function(err, relatedPosts){
      res.render('post', {url: req.path.split('/')[1], user: req.user, tags:results.uniqueTags, totalPosts: results.count, popularPosts: results.popularPosts, post: results.post, relatedPosts: relatedPosts});
    })
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
  async.parallel({
    posts: function(cb){Blog.Post.findTagPosts(req.params.name, cb)},
    count: function(cb){Blog.Post.findTotalTagPosts(req.params.name, cb)}
  }, function(err, results){
    res.send({posts:results.posts, count:results.count, user: req.user});
  });
})

router.get('/search', function(req, res){
  async.parallel({
    posts: function(cb){Blog.Post.findPostsOnSearch(req.query.params, cb)},
    count: function(cb){Blog.Post.findTotalSearchedPosts(req.query.params, cb)}
  }, function(err, results){
    res.send({posts:results.posts, count:results.count, user: req.user});
  })
})

router.get('/olderPosts', function(req, res){
  Blog.Post.findOlderPosts(req.query.id, function(err, posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      res.send({posts: posts, user: req.user})
    }
  });
})

router.get('/newerPosts', function(req, res){
  Blog.Post.findNewerPosts(req.query.id, function(err,posts){
    if (err) {
      console.log("db error in GET /newerPosts: " + err);
      res.render('error');
    } else {
      res.send({posts: posts, user: req.user});
    }
  });
})

router.get('/olderReviews', function(req, res){
  Review.findOlder(req.query.id, function(err, reviews){
    if (err) {
      console.log("db error in GET /olderReviews: " + err);
      res.render('error');
    } else {
       res.send({reviews: reviews, user: req.user})
    }
  });
})

router.get('/newerReviews', function(req, res){
  Review.findNewer(req.query.id, function(err, reviews){
    if (err) {
      console.log("db error in GET /olderReviews: " + err);
      res.render('error');
    } else {
      res.send({reviews: reviews, user: req.user});
    }
  });
})

router.delete('/reviews/:id', function(req, res){
  Review.delete(req.params.id, function(err){
    if (err) {
      console.log("db error in DELETE /posts: " + err);
      res.render('error');
    } else {
      res.send('success')
    }
  })
})

router.delete('/deleteImage/:id', function(req,res, next){
  Blog.Post.deleteImage(req.params.id, function(){
    res.send('success')
  })
})

router.put('/changeImage/:id', function(req, res, next){
  async.waterfall([
    function(cb){form.parse(req, cb)},
    function(fields, files, cb){Blog.Post.updateImage(req.params.id, files, cb)}
    ], function(err, result){
      res.send(result)
  })
})

router.post('/addEmail', function(req, res, next){
  new Blog.EmailList({email: req.body.email}).save(function(err, email){
    if(err){res.send(err)}
    else {res.send(email)}
  });
})

router.get('/olderSearchPosts', function(req, res, next){
  Blog.Post.findOlderSearchPosts(req.query.searchWords, req.query.id, function(err,posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      res.send({posts: posts, user: req.user})
    }
  });
})

router.get('/newerSearchPosts', function(req, res, next){
  Blog.Post.findNewerSearchPosts(req.query.searchWords, req.query.id, function(err,posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      res.send({posts: posts, user: req.user})
    }
  });
})

router.get('/olderTagPosts', function(req, res, next){
  Blog.Post.findOlderTagPosts(req.query.searchTag, req.query.id, function(err,posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      res.send({posts:posts, user: req.user})
    }
  });
})

router.get('/newerTagPosts', function(req, res, next){
  Blog.Post.findNewerTagPosts(req.query.searchTag, req.query.id, function(err,posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      res.send({posts: posts, user: req.user})
    }
  });
})

router.post('/documentRequest', function(req, res, next){
  var documents = [];
  for(prop in req.body.documents) {
    if (req.body.documents[prop] == true) {
      documents.push(prop)
    }
  }
  var message = "<b>Hello from your favourite wife</b><p>A new request for documents was submitted</p><h2>Request</h2><p><b>Phone: </b>" + req.body.phone + "<br><b>Email: </b>" + req.body.email + "<br><b>Comment: </b>" + req.body.comment + "<br><b>Documents: </b>" + documents.join(', ') + "<br><br>Don't forget to answer!<br> Best, your email provider - wife.com"
    var email = new helpers.Email(message);
    mailer.sendMail(email, function(err, info){
    if (err ){
      console.log(err);
    }
    else {
      console.log('Message sent: ' + info.response);
      res.send("Success")
    }
  })
})

router.post('/submitEmail', function(req, res, next){
  var message = "<b>Hello from your favourite wife</b><p>You received a new email from your website</p><h2>Email</h2><p><b>Name: </b>" + req.body.name + "<br><b>Email: </b>" + req.body.email + "<br><b>Message: </b>" + req.body.message + "<br><br>Don't forget to answer!<br> Best, your email provider - wife.com"
  var newEmail = new email(message);
  mailer.sendMail(newEmail, function(err, info){
    if (err ){
      console.log(err);
    }
    else {
      console.log('Message sent: ' + info.response);
      res.send("Success")
    }
  })
})

module.exports = router;
