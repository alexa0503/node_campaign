var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var schema = mongoose.Schema({
	openid: String,
	nickname: String,
	headImg: String,
	gender: String,
	province: String,
	city: String,
	country: String,
	created: Date,
    createdIp: String
});

schema.methods.getGender = function(){
    if (this.gender == 1)
        return '男';
    else if (this.gender == 0)
        return '女';
    else
        return '';
};
schema.plugin(mongoosePaginate);
var WxUser = mongoose.model('wx_user', schema);
module.exports = WxUser;
