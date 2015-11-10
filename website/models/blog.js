var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var crate = require('mongoose-crate');
var S3 = require('mongoose-crate-s3');
var S3info = require('../config')

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
    date      : Date
});

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

Posts.index({title: "text", body: "text"});

Posts.methods.getFirstTen = function(callback){
    callback("wooho")
}

var Post = mongoose.model('Post', Posts);
var Comment = mongoose.model('Comment', Comments);

module.exports = {
    Post    : Post,
    Comment: Comment
}

