var mongoose = require('mongoose');
var Messenger_Schema = require('../schema/Messenger');
var Messenger_Model = mongoose.model('Messenger', Messenger_Schema, 'Messenger_history');

module.exports = Messenger_Model;