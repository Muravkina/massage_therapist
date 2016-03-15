var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var crate = require('mongoose-crate');
var S3 = require('mongoose-crate-s3');
var S3info = require('../config');
//Amazon S3 configuration
var knox = require('knox').createClient({
    key: S3info.S3_KEY,
    secret: S3info.S3_SECRET,
    bucket: S3info.S3_BUCKET
});

var Comments = new mongoose.Schema({
    title     : String,
    body      : String,
    date      : Date,
    name      : {type: String, required: true},
    email     : {type: String, required: true},
    website   : String
});


var Posts   = new mongoose.Schema({
    title     : String,
    body      : String,
    tags      : Array,
    comments  : [Comments],
    date      : Date,
    uniqueTags: Array
});


var EmailList = new mongoose.Schema({
    email : String
})



Posts.plugin(crate, {
    storage: new S3({
    key: S3info.S3_KEY,
    secret: S3info.S3_SECRET,
    bucket: S3info.S3_BUCKET,
    path: function(attachment) {
      return '/' + attachment.name
    }
  }),
  fields: {
    image: {}
  }
})

Posts.statics.findPopularPosts = function(cb){
    return this.aggregate([ {$unwind: "$comments"},
                            {$group: {_id:"$_id", title: {$first :"$title"}, body: {$first :"$body"}, image: {$first: "$image"}, comments: {$push:"$comments"}, size: {$sum:1}}},
                            {$sort:{size:-1}}], cb );
};
Posts.statics.findUniqueTags = function(cb){
    this.distinct('tags').exec(function(err, tags){
      var uniqueTags = [];
      uniqueTags = tags.filter(function(elem, index, self){
        return index == self.indexOf(elem);
      })
      return cb(uniqueTags);
    });
};
Posts.statics.findFirstTenPosts = function(cb){
  return this.find({}).limit(10).sort({date: 'desc'}).exec(cb);
}
Posts.statics.findRelatedPosts = function(tags, cb){
  return this.find({tags: {$in: tags}}).sort({"_id":-1}).limit(3).exec(cb);
}
Posts.statics.findThisPagePosts = function(first, cb){
  return this.find({_id : { "$lte" : first } }).sort({"_id":-1}).limit(10).exec(cb);
}
Posts.statics.findOlderPosts = function(last, cb){
  return this.find( {_id : { "$lt" : last } } ).limit(10).sort({"_id":-1}).exec(cb);
}
Posts.statics.findNewerPosts = function(last, cb){
  return this.find( {_id : { "$gt" : last } } ).sort({"_id": -1}).limit(10).exec(cb);
}
Posts.statics.findPostsOnSearch = function(text, cb){
  return this.find({ $text: {$search: text}}).sort({"_id":-1}).limit(10).exec(cb);
}
Posts.statics.findTotalSearchedPosts = function(text, cb){
  return this.count({$text: {$search: text}}, cb);
}
Posts.statics.deleteImage = function(id, cb){
  this.findByIdAndUpdate(id, {$unset: {image: ''}}, function (err, post) {
    knox.deleteFile(post.image.name, function(err, result) {
      if (err) {console.log(err)}
      else {
        cb
      }
    })
  })
}

Posts.pre('save', function(next){
  this.tags = this.tags[0].replace(/ /g,'').split(",");
  next()
})
Posts.pre('save', function(next, files){
  if (files.image) {
    this.attach('image', {path: files.image.path}, function(err){
      if(err){console.log(err)}
      next();
    })
  } else {
      next();
    }
})

Posts.index({title: "text", body: "text"});

var Post = mongoose.model('Post', Posts);
var Comment = mongoose.model('Comment', Comments);
var EmailList = mongoose.model('EmailList', EmailList)


module.exports = {
    Post    : Post,
    Comment : Comment,
    EmailList : EmailList
}

