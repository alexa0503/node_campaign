/**
 * Created by Alexa on 16/4/18.
 */
var GameModel = require('../../models/game.js'),
    moment = require('moment');
exports.list = function (req, res) {

    var limit = 50;
    var query = {};
    if(req.query.player == 'y'){
        query.playerId = {'$nin': [null],'$exists': true};
    }
    var context = {
        layout:'cms',
        user:req.user,
        active: { infoParent:true,allPlayer: req.query.player == 'y' ? false :true },
        title: '游戏记录'
    };

    GameModel.paginate(query,{page:req.query.page, limit:limit},function (err,result) {
        if (err) return console.log(err);
        context.games = result.docs.map(function (item) {
            return {
                id: item.id,
                creatorId: item.creatorId,
                playerId: item.playerId,
                createdAt: moment(item.createdAt).format('YYYY-MM-DD HH:MM:SS'),
                ipAddress: item.ipAddress ? item.ipAddress.replace(/^.*:/, '') : '--',
                playerIpAddress: item.playerIpAddress ? item.playerIpAddress.replace(/^.*:/, '') : '--',
            }
        });
        context.total = result.total;
        context.page = result.page;
        context.pages = result.pages;
        //context.paginate = paginate.getArrayPages(req)(3, result.total, req.query.page);
        context.pagination = { page: result.page, limit:limit,totalRows: result.total,queryParams: {player:req.query.player} };

        res.render('cms/games', context);
    })
};
