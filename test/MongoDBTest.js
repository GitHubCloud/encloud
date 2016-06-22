var mongoose = require('mongoose');

var db = mongoose.createConnection('localhost', 'user');

db.on('error', function (err) {
  console.log(err.stack);
});

db.on('open', function () {
  // Schema: 数据库的骨架，不具备操作数据库能力
  var userInfo_Schema = new mongoose.Schema({
    user_name: String,
    user_pwd: String,
    user_gender: Boolean,
    user_birth: {type: Date, default: Date.now}
  });

  // 可以给Schema自定义方法(需要实例化Model才能使用)
  userInfo_Schema.methods.speak = function () {
    console.log(this.user_name);
  }
  // 静态方法(在Model就可以使用)
  userInfo_Schema.statics.howl = function () {
    console.log("Ah Whoo hoo!!!!");
  }

  // Model: Schema生成的模型，可以操作数据库
  var userInfo_Model = db.model('user', userInfo_Schema, 'user_info');

  // Entity: Model创建的实体，只能操作自身？
  var userInfo_Entity = userInfo_Model({
    user_name: "Morty",
    user_pwd: "123456",
    user_gender: 1,
    user_birth: new Date("2001-10-23").toDateString()
  });


  userInfo_Model.howl();
  userInfo_Entity.speak();

  // save()方法保存Entity实例到数据库
  // userInfo_Entity.save();

  // 查询所有文档
  userInfo_Model.find(function (err, entities) {
    if(err){ console.error(err.stack); };
    console.log(entities);
  });

  // 按条件查询
  userInfo_Model.find({user_name:/^[Cc]/}, function (err, entities) {
    if(err){ console.error(err.stack); };
    console.log(entities);
  });

  // 删除
  userInfo_Model.remove({user_name: "Morty"}, function (err) {
    if(err){ console.log(err.stack); };
    console.log('remove ok');
  });

  // 关闭数据库
  // db.close();
});