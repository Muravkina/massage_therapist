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
  return this.find({}).count({}).exec(cb)
}



module.exports = mongoose.model('Reviews', ReviewsSchema);
