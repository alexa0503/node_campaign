var request = require('request'),
    url = require('url'),
    credentials = require('../credentials.js'),
    WxUser = require('../models/wxUser.js'),
    paginate = require('express-paginate'),
    moment = require('moment');
module.exports = function(app) {
    //后台首页
    app.use(paginate.middleware(10, 50));
    app.get('/cms', isAuthenticated,function (req,res) {
        res.render('cms/dashboard',{layout:'cms',user:req.user,active: { dashboard: true }});
    });

    //微信授权用户
    app.get('/cms/wxusers', isAuthenticated, function (req, res, next) {
        var context = {
            layout:'cms',
            user:req.user,
            active: { wxUsers: true }
        };
        var limit = 20;
        WxUser.paginate({},{page:req.query.page, limit:limit},function (err,result) {
            if (err) next(err);
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
            console.log(paginate.href);
            res.render('cms/wxusers', context);
        })


    });

    //后台登录
    app.get('/login', function(req, res) {
        res.render('cms/login',{layout:null,message:req.flash('message')});
    });

    //后台注销
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });
};

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}