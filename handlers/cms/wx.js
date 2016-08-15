/**
 * Created by Alexa on 16/4/18.
 */
var WxUser = require('../../models/wxUser.js'),
    moment = require('moment');
exports.list = function (req, res) {
    var context = {
        layout:'cms',
        user:req.user,
        active: { infoParent:true,wxUsers: true },
        title: '授权用户'
    };
    var limit = 20;
    WxUser.paginate({},{page:req.query.page, limit:limit},function (err,result) {
        if (err) return handleError(err);
        context.wxUsers = result.docs.map(function (item) {
            return {
                nickname: item.nickname,
                headImg: item.headImg,
                gender: item.getGender(),
                country: item.country,
                province: item.province,
                city: item.city,
                created: moment(item.created).format('YYYY-MM-DD HH:MM:SS'),
                createdIp: item.createdIp
            }
        });
        context.total = result.total;
        context.page = result.page;
        context.pages = result.pages;
        //context.paginate = paginate.getArrayPages(req)(3, result.total, req.query.page);
        context.pagination = { page: result.page, limit:limit,totalRows: result.total };

        res.render('cms/wxusers', context);
    })
};