var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StatusSchema = new Schema({
    count: Number,
    available: Boolean,
    location: String,
    notes: String
});


module.exports = mongoose.model('Status', StatusSchema);
