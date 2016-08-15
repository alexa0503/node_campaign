var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	token: String,
	expire_time: Date,
});

var WxToken = mongoose.model('wx_token', userSchema);
module.exports = WxToken;
