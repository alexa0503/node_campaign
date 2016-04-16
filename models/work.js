var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var schema = mongoose.Schema({
	title: String,
	imgPath: String,
	desc: String,
	link: String,
	createdTime: Date,
    createdIp: String
});

schema.plugin(mongoosePaginate);
var Case = mongoose.model('t_work', schema);
module.exports = Case;
