var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RewiewsSchema = new Schema({
    author: String,
    body: String,
    created_at: { type: Date, default: Date.now },
    stars: Number
})

module.exports = mongoose.model('Reviews', ReviewsSchema);
