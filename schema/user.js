var mongoose = require('mongoose');

var userInfo_Schema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true
  },
  user_pwd: {
    type: String,
    required: true
  },
  Admin: Boolean,
  user_gender: Boolean,
  user_address: String,
  user_birth: {
    type: Date,
    default: null
  },
  user_sns: String,
  user_biography: String,
  user_avatar: String
});

userInfo_Schema.statics = {
  findById: function (id, cb) {
    return this.findOne({"_id": id}, cb);
  }
}

module.exports = userInfo_Schema;