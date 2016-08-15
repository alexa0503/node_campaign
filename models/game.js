var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var GameSchema = mongoose.Schema({
	creatorId: String,
	playerId: String,
	createdAt: { type: Date, default: Date.now },
    ipAddress: String,
	playerIpAddress: { type: String, default: null },
	status: { type: Number, default:0 }
});

GameSchema.plugin(mongoosePaginate);
var GameModel = mongoose.model('t_game', GameSchema);
module.exports = GameModel;
