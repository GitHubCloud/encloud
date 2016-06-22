var mongoose = require('mongoose');

var db = mongoose.createConnection('localhost', 'user');

db.on('open', function () {
  var testSchema = new mongoose.Schema({
    name: String,
    binary: Buffer,
    living: Boolean,
    updated: Date,
    age: Number,
    mixed: mongoose.Schema.Types.Mixed, // 该混合类型等同于nested，可以直接用{}
    _id: mongoose.Schema.Types.ObjectId, // 主键
    _fk: mongoose.Schema.Types.ObjectId, // 外键
    array: [],
    arrOfString: [String],
    arrOfNumber: [Number],
    arrOfDate: [Date],
    arrOfBuffer: [Buffer],
    arrOfBoolean: [Boolean],
    arrOfMixed: [mongoose.Schema.Types.Mixed],
    arrOfObjectId: [mongoose.Schema.Types.ObjectId],
    nested: {
      stuff: String
    }
  });
  console.log(testSchema);
});