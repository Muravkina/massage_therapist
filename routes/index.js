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
var template = new EmailTemplate(path.join(templatesDir, 'newpost'))

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
  Review.find({}).sort({"_id":-1}).limit(10).exec(function(err, reviews) {
    if (err) {
      console.log("db error in GET /reviews: " + err);
      res.render('error');
    } else {
      Review.count({}, function(err, count){
        if (err) {
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
  Blog.Post.findFirstTenPosts(function(err, posts){
    if (err) {
      console.log("db error in GET /blog: " + err);
      res.render('error');
    } else {
      Blog.Post.count({}, function(err, count){
        Blog.Post.findPopularPosts(function(err, popularPosts){
          if (err) {console.log(err)}
          Blog.Post.findUniqueTags(function(uniqueTags) {
            if(err){console.log(err)}
            res.render('blog', {url: req.path.split('/')[1], posts: posts, user: req.user, tags:uniqueTags, totalPosts: count, popularPosts: popularPosts});
          })
        })
      })
    };
  })
})

router.get('/back', function(req, res){
  Blog.Post.findFirstTenPosts(function(err, posts){
    if(err){
      console.log("db error in GET /blog: " + err);
      res.render('error');
    } else {
      res.send(posts)
    }
  })
})

router.post('/blog', function(req, res){
  var form = new formidable.IncomingForm();
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
})

router.delete('/posts/:id', function(req, res){
  Blog.Post.findOne({'_id': req.params.id}).remove().exec(function(err){
    if (err) {
      console.log("db error in DELETE /posts: " + err);
      res.render('error');
    } else {
      Blog.Post.findThisPagePosts(req.body.firstPostId, function(err, posts){
        if (err) {res.send(err)}
        else {res.send({posts: posts, id: req.params.id})}
      })
    }
  })
})

router.put('/posts/:id', function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    Blog.Post.findById(req.params.id, function (err, post) {
      if (err) res.send(err);
        post.title = fields.title;
        post.body = fields.body;
        post.tags = fields.tags;
        post.save(files).then(function(post){
          res.send(post)
        })
    });
  });
})

router.get('/posts/:id', function(req, res){
  Blog.Post.findById(req.params.id, function(err, post){
    if (err) {
      res.send(err)
    } else {
      Blog.Post.findRelatedPosts(post.tags, function(err, relatedPosts){
        if (err) {res.send(err)}
        else {
          Blog.Post.findPopularPosts(function(err, popularPosts){
            if(err){console.log(err)}
            Blog.Post.findUniqueTags(function(uniqueTags){
              Blog.Post.count({}, function(err, count){
                res.render('post', {url: req.path.split('/')[1], user: req.user, tags:uniqueTags, totalPosts: count, popularPosts: popularPosts, post: post, relatedPosts: relatedPosts});
              })
            })
          })
        }
      })
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
  Blog.Post.find({tags: { $in: [req.params.name] }}).sort({"_id":-1}).limit(10).exec(function(err, posts){
    if (err) {res.send(err)}
    else {
      Blog.Post.count({tags: { $in: [req.params.name] }}, function(err, count){
        if(err){res.send(err)}
        else{
          res.send({posts:posts, count:count});
        }
      })
    }
  })
})

router.get('/search', function(req, res){
  Blog.Post.find(
    { $text: {$search: req.query.params}}
    ).sort({"_id":-1}).limit(10).exec(function(err, posts){
    if (err) {
      res.send(err);
    } else {
      Blog.Post.count({$text: {$search: req.query.params}}, function(err, count){
        if(err){res.send(err)}
        else{
          res.send({posts:posts, count: count});
        }
      })
    }
  })
})

router.get('/olderPosts', function(req, res){
  Blog.Post.findOlderPosts(req.query.id, function(err, posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      res.send(posts)
    }
  });
})

router.get('/newerPosts', function(req, res){
  Blog.Post.findNewerPosts(req.query.id, function(err,posts){
    if (err) {
      console.log("db error in GET /newerPosts: " + err);
      res.render('error');
    } else {
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

router.delete('/deleteImage/:id', function(req,res, next){
  Blog.Post.findByIdAndUpdate(req.params.id, {$unset: {image: ''}}, function (err, post) {
    knox.deleteFile(post.image.name, function(err, result) {
      if (err) res.send(err);
      res.send('success')
    });
  })
})

router.put('/changeImage/:id', function(req, res, next){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    Blog.Post.findByIdAndUpdate(req.params.id, {$unset: {image: ''}}, function(err, post){
      knox.deleteFile(files.image.name, function(err, result) {
        if (err) {res.send(err)}
        else {
          post.attach('image', {path: files.image.path}, function(error){
          if (err) res.send(err);
          post.save()
          res.send(post)
          })
        }
      });
    });
  })
})

router.post('/addEmail', function(req, res, next){
  new Blog.EmailList({email: req.body.email}).save(function(err, email){
    if(err){res.send(err)}
    else {res.send(email)}
  });
})

router.get('/olderSearchPosts', function(req, res, next){
  Blog.Post.find({ $text: {$search: req.query.searchWords}, _id : { "$lt" : req.query.id } } ).sort({"_id":-1}).limit(10).exec(function(err,posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      res.send(posts)
    }
  });
})

router.get('/newerSearchPosts', function(req, res, next){
  Blog.Post.find({ $text: {$search: req.query.searchWords}, _id : { "$gt" : req.query.id } } ).sort({"_id":1}).limit(10).exec(function(err,posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      posts.reverse();
      res.send(posts)
    }
  });
})

router.get('/olderTagPosts', function(req, res, next){
  Blog.Post.find({ tags: { $in: [req.query.searchTag] }, _id : { "$lt" : req.query.id } } ).sort({"_id":-1}).limit(10).exec(function(err,posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      res.send(posts)
    }
  });
})

router.get('/newerTagPosts', function(req, res, next){
  Blog.Post.find({ tags: { $in: [req.query.searchTag] }, _id : { "$gt" : req.query.id } } ).sort({"_id":1}).limit(10).exec(function(err,posts){
    if (err) {
      console.log("db error in GET /olderPosts: " + err);
      res.render('error');
    } else {
      posts.reverse();
      res.send(posts)
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
  var email = {
    from: 'massagebygerill@gmail.com',
    to: 'massagebygerill@gmail.com',
    subject: 'Request for documents',
    html: message
  };
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
  var email = {
    from: 'massagebygerill@gmail.com',
    to: 'massagebygerill@gmail.com',
    subject: 'New Message from your website',
    html: message
  };
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

module.exports = router;
