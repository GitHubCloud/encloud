var mongoose = require('mongoose');
var Msg_Schema = require('../schema/msg');
var Msg_Model = mongoose.model('msg', Msg_Schema, 'msg_history');

module.exports = Msg_Model;