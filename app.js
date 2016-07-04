var express = require('express');
var io = require('socket.io');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var captchapng = require('captchapng');
var path = require('path');
var crypto = require('crypto');

var app = express();

// createConnection虽能打开数据库，但却操作不了
mongoose.connect("mongodb://localhost/user");
var db = mongoose.connection;

app.set('view engine', 'jade');
app.set('views', __dirname + "/views");

// 中间件
app.use(bodyParser.json({limit: '1mb'}));
app.use(bodyParser.urlencoded({extended: false, limit: '1mb'}));
app.use(cookieParser());
app.use(session({
	resave: false,
	saveUninitialized: true,
	secret: 'Encloud'
}));

// 静态资源目录
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'bower_components')));

var port = process.env.PORT || 80;
var server = app.listen(port);
io = io.listen(server);
console.log('Server running at port %s', port);

// json配置文件
var config = require('./config.json');

// 监听服务器事件
io.on('connection', function (socket) {
	// 用Messenger推送全站广播
	socket.on('messenger', function (type, msg) {
		socket.broadcast.emit('messenger', type, msg);
	});
});

// 自定义命名空间
var chat = io.of('/chatroom');
var users = {};// 在线用户
chat.on('connection', function (socket) {
	// 在聊天室发送系统信息
	socket.on('sysmsg', function (msg) {
		socket.broadcast.emit('sysmsg', msg);
	});

	// 用户发送信息
	socket.on('sendmsg', function (from, msg) {
		writeInHistory(msg, from);
		socket.broadcast.emit('pushmsg', 'OTHER', from, msg);
	});

	// 进入聊天室
	socket.on('join', function (from) {
		socket.broadcast.emit('sysmsg', '欢迎 <i>' + from.uname + '</i> 进入聊天室');
		socket.emit('sysmsg', '欢迎 <i>' + from.uname + '</i> 进入聊天室');
		users[from.uname] = {
			uname: from.uname,
			ugender: from.ugender,
			uavatar: from.uavatar
		}
		socket.broadcast.emit('updateusers', users);
	});

	// 离开聊天室
	socket.on('leave', function (from) {
		socket.broadcast.emit('sysmsg', "<i>" + from.uname + "</i> 离开了聊天室");
		delete users[from.uname];
		socket.broadcast.emit('updateusers', users);
	});

	// 更新在线用户
	socket.on('updateusers', function () {
		socket.emit('updateusers', users);
	});
});

// 把信息写进历史记录
function writeInHistory(msg, from) {
	var msg_model = require('./model/msg');
	var msg_entity = msg_model({
		msg_content: msg,
		msg_from: from['uname']
	});
	msg_entity.save(function (err) {
		if(err){ console.error(err.stack); }
	});
}

// Admin
app.get('/Cloud', function (req, res) {
	// res.send(req.session.Admin);
	console.log(req.session);
	if(req.session.uid && req.session.Admin){
		var user = require('./model/user');
		user.find({_id: req.session.uid, Admin: req.session.Admin}, function (err) {
			if(err){ console.error(err.stack); }
			res.render('Cloud', {
				title: 'Cloud',
				config: config
			});
		});
	}else{
		res.redirect('/login');
	}
});

// 首页
app.get('/', function (req, res) {
	res.render('index', {
		title: '首页',
		config: config,
		position: 'index',
		js: ['Swiper/dist/js/swiper.jquery.min.js'],
		css: ['Swiper/dist/css/swiper.min.css'],
		kwd: '关键字',
		des: '描述',
		banner: require('./banner')
	});
});

// 聊天室
app.get('/chatroom', function (req, res) {
	var id = req.cookies['uid'];
	var user = require('./model/user');
	user.findById(id, function (err, usr) {
		if(err) console.error(err.stack);
		res.render('chatroom', {
			title: 'chatroom',
			config: config,
			position: 'chatroom',
			js: ['js/chatroom.js','malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js'],
			css: ['css/chatroom.css','malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.min.css'],
			user: usr?usr:{id:0}
		});
	});
});

// 上传头像
app.post('/uploadAvatar', function (req, res) {
	var gm = require('gm');
	var uid = req.body.id;
	var uname = req.body.uname;
	var avatar = req.body.avatar;
	var ext = avatar.substr(avatar.indexOf('/') + 1, avatar.indexOf(';') - avatar.indexOf('/') - 1);// 文件后缀
	var aBase64 = avatar.replace(/^data:image\/\w+;base64,/, "");// 去掉格式信息后的base64编码头像
	var aBuffer = new Buffer(aBase64, 'base64');
	var filename = uname + '-' + uid + '-' + Date.now() + "." + ext;
	gm(aBuffer)
	.resize(100, 100, '!')
	.noProfile()
	.write("public/upload/avatar/" + filename, function (err) {
		if(err){ console.log(err.stack); }
		var user = require('./model/user');
		var update = {$set:{'user_avatar': 'upload/avatar/' + filename}};
		user.update({'_id':uid}, update, function (err, d) {
			if(err) console.error(err.stack);
			if(d.ok == 1){
				res.send({status:1});
			}else{
				res.send({status:0});
			}
		});
	});
});

// user
app.get('/user', function (req, res) {
	var id = req.cookies['uid'];
	if(id){
		var user = require('./schema/user');
		var user_model = mongoose.model('user', user, 'user_info');
		user_model.findById(id, function (err, usr) {
			if(err) console.error("ErroR: " + err.stack);
			if(usr){
				res.render('user', {
					config: config,
					position: 'user',
					css: ['bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css'],
					js: ['bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js','bootstrap-datepicker/dist/locales/bootstrap-datepicker.zh-CN.min.js'],
					user: usr
				});
			}else{
				redirect404(res);
			}
		});
	}else{
		res.redirect('/login');
	}
});

// 修改密码
app.get('/user/changepwd', function (req, res) {
	if(req.cookies['uid']){
		res.render('changepwd', {
			title: '修改密码',
			position: 'user',
			config: config,
			js: ['bootstrap-validator/dist/validator.min.js'],
		});
	}else{
		res.redirect('/login');
	}
});
app.post('/user/changepwd', function (req, res) {
	var id = req.cookies['uid'];
	if(id){
		var ori_pwd = req.body.ori_pwd;
		var user_pwd = req.body.user_pwd;
		var repwd = req.body.repwd;
		if(ori_pwd && user_pwd && repwd && user_pwd == repwd){
			ori_pwd = md5encrypt(ori_pwd);
			user_pwd = md5encrypt(user_pwd);
			var user = require('./model/user');
			user.findOne({'_id':id,'user_pwd':ori_pwd}, function (err, d) {
				if(d){
					var update = {$set:{'user_pwd': user_pwd}};
					user.update({'_id':id}, update, function (err, d) {
						if(err) console.error(err.stack);
						if(d.ok == 1){
							res.send({status:1});
						}else{
							res.send({status:0});
						}
					});
				}else{
					res.send({status:0});
				}
			});
		}else{
			res.send({status:0});
		}
	}else{
		res.send({status:0});
	}
});

// list
app.get('/list(/:page)?', function (req, res) {
	var page = req.params.page?req.params.page:1;
	var user = require('./model/user');
	user.find({})
		.skip(page * config.page.count - config.page.count)
		.limit(config.page.count)
		.exec(function (err, usrs) {
			if(err) console.error(err.stack);
			user.count({}, function (err, count) {
				if(err) console.error(err.stack);
				var totalPage = Math.ceil(count / config.page.count);
				if(page > totalPage){
					redirect404(res);
				}else{
					res.render('list', {
						title: "list",
						config: config,
						position: 'list',
						usrs: usrs,
						page: page,
						totalPage: totalPage,
						uid: req.cookies['uid']
					});
				}
			});
		});
});

// 验证码
app.get('/captcha.png', function (req, res) {
	var cap = parseInt(Math.random() * 9000 + 1000);
	var p = new captchapng(100, 34, cap);
	p.color(parseInt(Math.random()*255), parseInt(Math.random()*255), parseInt(Math.random()*255), parseInt(Math.random()*255));
	p.color(parseInt(Math.random()*255), parseInt(Math.random()*255), parseInt(Math.random()*255), parseInt(Math.random()*255));

	req.session.captcha = {
		captcha: cap,
		expire: (new Date()).getTime() + 1000 * 60 * 10
	}

	var img = p.getBase64();
	var imgbase64 = new Buffer(img, 'base64');
	res.setHeader('Content-Type', 'image/png');
	res.send(imgbase64);
});

// 判断验证码
app.get('/captcha', function (req, res) {
	if(req.session.captcha && req.query.captcha){
		var cap = req.session.captcha.captcha;
		var expire = new Date(req.session.captcha.expire);
		if(Date.now() < expire && req.query.captcha == cap){
			res.send('ok');
		}else{
			res.status(406).send('wrong');
		}
	}else{
		res.status(406).send('wrong');
	}
});

// 注册
app.get('/register', function (req, res) {
	res.render('register',{
		title: '注册',
		position: 'register',
		config: config,
		js: ['bootstrap-validator/dist/validator.min.js']
	});
});
app.post('/register', function (req, res) {
	var user_name = req.body.user_name;
	var user_pwd = req.body.user_pwd;
	var user_gender = req.body.user_gender;
	var captcha = req.body.captcha;
	if(user_name && user_pwd && captcha && captcha == req.session.captcha.captcha){
		user_pwd = md5encrypt(user_pwd);

		var user = require('./model/user');
		var user_Entity = user({
			user_name: user_name,
			user_pwd: user_pwd,
			user_gender: user_gender
		});
		user_Entity.save(function (err) {
			if(err) console.error(err.stack);
			res.render('result', {
				title: '注册成功',
				position: 'register',
				config: config,
				content: '注册成功！'
			});
		});
	}else{
		res.render('result', {
			title: '注册失败',
			position: 'register',
			config: config,
			content: '未知错误，注册失败！'
		});
	}
});

// 登录
app.get('/login', function (req, res) {
	if(req.cookies['uid']){
		res.redirect('/user');
	}else{
		res.render('login' ,{
			title: "登录",
			position: "login",
			config: config,
			js: ['bootstrap-validator/dist/validator.min.js']
		});
	}
});
app.post('/login', function (req, res) {
	var user_name = req.body.user_name;
	var user_pwd = req.body.user_pwd;
	var remember = req.body.remember_login;
	if(user_name && user_pwd){
		user_pwd = md5encrypt(user_pwd);
		var user = require('./model/user');
		user.findOne({'user_name': user_name, 'user_pwd': user_pwd}, function (err, d) {
			if(err) console.error(err.stack);
			if(d){
				if(d.Admin){ req.session.Admin = d.Admin; }
				if(remember == 'true'){
					res.cookie('uid', d._id, {
						maxAge: 60000 * 60 * 24 * 7,
						httpOnly: false
					});
				}else{
					res.cookie('uid', d._id, {
						httpOnly: false
					});
				}
				req.session.uid = d._id;
				res.send('ok');
			}else{
				res.send('wrong');
			}
		});
	}else{
		res.status(406).send('未知错误，登录失败！');
	}
});

// 检查用户名是否重复
app.get('/checkNameRepeat', function (req, res) {
	var user_name = req.query.user_name;
	if(user_name){
		var user = require('./model/user');
		user.findOne({'user_name': user_name}, function (err, d) {
			if(err) console.error(err.stack);
			if(d){
				res.status(406).send('wrong');
			}else{
				res.send('ok');
			}
		});
	}else{
		res.status(406).send('wrong');
	}
});

// 检查密码是否正确
app.get('/checkPwd', function (req, res) {
	var id = req.cookies['uid'];
	var user_pwd = req.query.ori_pwd;
	if(user_pwd && id){
		user_pwd = md5encrypt(user_pwd);
		var user = require('./model/user');
		user.findOne({'_id':id, 'user_pwd':user_pwd}, function (err, d) {
			if(err) console.error(err.stack);
			if(d){
				res.send('ok');
			}else{
				res.status(406).send('wrong');
			}
		});
	}else{
		res.status(406).send('wrong');
	}
});

// 修改资料
app.post('/saveprofile', function (req, res) {
	if(req.cookies['uid']){
		var id = req.body.id;
		var set = {}
		for(var i in req.body){
			if(i!='id'){
				set[i] = req.body[i];
			}
		}

		var user = require('./model/user');
		var update = {$set:set};
		user.update({'_id':id}, update,
			function (err, d) {
				if(err) console.error(err.stack);
				if(d.ok == 1){
					res.send({status:1});
				}else{
					res.send({status:0});
				}
			}
		);
	}
});

// 注销
app.post('/logout', function (req, res) {
	res.cookie('uid', '', {maxAge:-1});
	req.cookies['connect.sid'].maxAge = -1;
	res.send({status: 1});
});

// 删除帐号
app.post('/delAccount', function (req, res) {
	var id = req.body.id;
	if(id){
		var user = require('./model/user');
		user.remove({"_id": id}, function (err, d) {
			if(err) console.error(err.stack);
			res.send({status:1, id: id});
		});
	}else{
		res.send({status: 0, id: id});
	}
});

// example
app.get('/example', function (req, res) {
	res.render('example', {
		title: "Example",
		config: config
	});
});

// jade
app.get('/jade', function (req, res) {
	res.render('jade', {
		title: "jade",
		config: config,
		position: 'jade',
		content: 'jade基本用法展示'
	});
});

// ajax
app.post('/ajax', function (req, res) {
	res.send('test123123');
});

// 404
app.get('*', function (req, res) {
	redirect404(res);
});

// app.use(function (req, res) {
// 	redirect404(res);
// });

var redirect404 = function (res) {
	res.statusCode = 404;
	res.render('404', {
		title: "404",
		config: config
	});
}

var md5encrypt = function (val) {
	var md5 = crypto.createHash('md5');
	md5.update(val);
	return md5.digest('hex');
}

var encrypto = function (key, val) {
	var cipher = crypto.createCipher('aes192', key);
	cipher.update(val, 'utf8', 'hex');
	var en = cipher.final('hex');
	return en;
}

var decrypto = function (key, val) {
	var decipher = crypto.createDecipher('aes192', key);
	decipher.update(val, 'hex', 'utf8');
	var de = decipher.final('utf8');
	return de;
}