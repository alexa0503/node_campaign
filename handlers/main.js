var Work = require('../models/work.js'),
    moment = require('moment');
exports.home = function(req, res, next) {
    /*
    var wxShare = {};
    wxShare.appId = credentials.wx.appId;
    wxShare.url = credentials.wx.url;
    wxShare.title = '微信分享标题';
    wxShare.desc = '微信分享描述';
    wxShare.link = 'http://'+credentials.hostname;
    wxShare.imgUrl = 'http://'+credentials.hostname+'/images/share.jpg';
    */
    Work.find().sort({'_id':-1}).limit(4).exec(function (err,result) {
        if (err) next();
        var works = result.map(function (item) {
            return {
                title: item.title,
                imgPath: item.imgPath,
                desc: item.desc,
                link: item.link,
                created: moment(item.created).format('YYYY-MM-DD HH:MM:SS'),
                createdIp: item.createdIp
            }
        });
        res.render('index',{user:req.session.wxUser,works:works});
    })
};
exports.works = function (req, res, next) {
    var context = {
        title: '作品查看'
    };
    var limit = 8;
    console.log(req.query.page);
    Work.paginate({},{page:req.query.page, limit:limit},function (err,result) {
        //if (err) return handleError(err);
        if (err) next();
        context.works = result.docs.map(function (item) {
            return {
                _id: item._id,
                title: item.title,
                imgPath: item.imgPath,
                desc: item.desc,
                link: item.link,
                createdTime: moment(item.createdTime).format('YYYY-MM-DD HH:MM:SS'),
                createdIp: item.createdIp
            }
        });
        context.total = result.total;
        context.page = result.page;
        context.pages = result.pages;
        //context.paginate = paginate.getArrayPages(req)(3, result.total, req.query.page);
        context.pagination = { page: req.query.page, limit:limit,totalRows: result.total };
        res.render('works', context);
    })
};