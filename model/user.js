var mongoose = require('mongoose');
var userInfo_Schema = require('../schema/user');
var userInfo_Model = mongoose.model('user', userInfo_Schema, 'user_info');

module.exports = userInfo_Model;