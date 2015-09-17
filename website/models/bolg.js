var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var BlogSchema   = new Schema({
    title: String,
    body: String,
    created_at : Date
});

BlogSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();

  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

module.exports = mongoose.model('Blog', BlogSchema);

