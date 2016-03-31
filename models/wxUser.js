var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	openid: String,
	nickname: String,
	headImg: String,
	gender: String,
	province: String,
	city: String,
	country: String,
	created: Date,
});

var WxUser = mongoose.model('wx_user', userSchema);
module.exports = WxUser;
