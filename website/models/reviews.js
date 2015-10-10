var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ReviewsSchema = new Schema({
    author: { type: String, required: true },
    body: {type: String, required: true },
    email: String,
    stars: { type: Number, required: true}
})



module.exports = mongoose.model('Reviews', ReviewsSchema);
