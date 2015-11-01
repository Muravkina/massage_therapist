var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var crate = require('mongoose-crate');
var  S3 = require('mongoose-crate-s3');

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
    key: process.env.AWS_ACCESS_KEY,
    secret: process.env.AWS_SECRET_KEY,
    bucket: process.env.S3_BUCKET,
    path: function(attachment) {
      return '/' + attachment.name
    }
  }),
  fields: {
    image: {}
  }
})

Posts.index({title: "text", body: "text"});

var Post = mongoose.model('Post', Posts);
var Comment = mongoose.model('Comment', Comments);

module.exports = {
    Post    : Post,
    Comment: Comment
}

