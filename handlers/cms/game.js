/**
 * Created by Alexa on 16/4/18.
 */
var GameModel = require('../../models/game.js'),
    moment = require('moment');
exports.list = function (req, res) {
    var context = {
        layout:'cms',
        user:req.user,
        active: { infoParent:true,games: true },
        title: '游戏记录'
    };
    var limit = 20;
    GameModel.paginate({},{page:req.query.page, limit:limit},function (err,result) {
        if (err) return handleError(err);
        context.games = result.docs.map(function (item) {
            return {
                id: item.id,
                creatorId: item.creatorId,
                playerId: item.playerId,
                createdAt: moment(item.createdAt).format('YYYY-MM-DD HH:MM:SS'),
                ipAddress: item.ipAddress,
                playerIpAddress: item.playerIpAddress,
            }
        });
        context.total = result.total;
        context.page = result.page;
        context.pages = result.pages;
        //context.paginate = paginate.getArrayPages(req)(3, result.total, req.query.page);
        context.pagination = { page: result.page, limit:limit,totalRows: result.total };

        res.render('cms/games', context);
    })
};
