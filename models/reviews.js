var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ReviewsSchema = new Schema({
    author: { type: String, required: true },
    body: {type: String, required: true },
    email: String,
    stars: { type: Number, required: true}
})

ReviewsSchema.statics.findTenReviews = function(cb){
  this.find({}).sort({"_id":-1}).limit(10).exec(function(err, reviews){
    if(err){console.log(err)}
    else{
      cb(null, reviews)
    }
  })
}
ReviewsSchema.statics.count = function(cb){
  return this.find({}).count({}).exec(cb);
}
ReviewsSchema.statics.findOlder = function(first, cb){
  return this.find( {_id : { "$lt" : first } } ).limit(10).sort({"_id":-1}).exec(cb);
}
ReviewsSchema.statics.findNewer = function(last, cb){
  return this.find( {_id : { "$gt" : last } } ).limit(10).sort({"_id":1})
    .exec(function(err, reviews){
      if(err) console.log(err)
      reviews.reverse()
      cb(reviews)
    });
}
ReviewsSchema.statics.delete= function(id, cb){
  return this.findOne({'_id': id}).remove().exec(cb);
}


module.exports = mongoose.model('Reviews', ReviewsSchema);
