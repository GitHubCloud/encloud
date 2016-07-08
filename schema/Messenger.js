var mongoose = require('mongoose');

var Messenger_Schema = new mongoose.Schema({
	Message: {
		type: String,
		required: true
	},
	Type: {
		type: String,
		required: true
	},
	Date: {
		type: Date,
		default: Date.now(),
		required: true
	},
	Sender: {
		type: Object,
		required: true
	}
});

Messenger_Schema.statics = {
	findById: function (id, cb) {
		return this.findOne({"_id": id}, cb);
	}
}

module.exports = Messenger_Schema;