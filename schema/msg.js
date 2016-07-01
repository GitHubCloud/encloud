var mongoose = require('mongoose');

var Msg_Schema = new mongoose.Schema({
  msg_content: {
    type: String,
    required: true
  },
  msg_from: {
    type: String,
    required: true
  },
  msg_to: {
    type: String,
    default: null
  },
  msg_time: {
    type: Date,
    default: Date.now(),
    required: true
  }
});

Msg_Schema.statics = {
  findById: function (id, cb) {
    return this.findOne({"_id": id}, cb);
  }
}

module.exports = Msg_Schema;