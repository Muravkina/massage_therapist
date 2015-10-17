var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
  name: String,
  username: { type: String, required: true, unique: true },
  password: String
});



UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', UserSchema);
