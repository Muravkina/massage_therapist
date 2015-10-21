var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Comments = new Schema({
    title     : String,
    body      : String,
    date      : Date,
    name      : {type: String, required: true},
    email     : {type: String, required: true},
    website   : String
});

var Tags = new Schema({
    name: String
})

var Posts = new Schema({
    title     : String,
    body      : String,
    tags      : [Tags],
    comments  : [Comments],
    date      : Date
});


var Tags = mongoose.model('Tag', Tags);
var Post = mongoose.model('Post', Posts);
var Comment = mongoose.model('Comment', Comments)
module.exports = {
    Post    : Post,
    Comment: Comment
}

