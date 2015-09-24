var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ReviewsSchema = new Schema({
    author: String,
    body: String,
    email: String,
    stars: Number
})



module.exports = mongoose.model('Reviews', ReviewsSchema);
