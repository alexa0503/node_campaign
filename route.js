var WxUser = require('./models/wxUser.js'),
    request = require('request'),
    url = require('url'),
    credentials = require('./credentials.js');
module.exports = function(app) {

    /**
     * 首页
     */
    app.get('/', wxAuth, function(req, res) {
        res.render('index');
    });

    /**
     * 后台首页
     */
    app.get('/cms', isAuthenticated,function (req,res) {
        res.render('dashboard');
    });
    /**
     * 后台登录
     */
    app.get('/login', function(req, res) {
        res.render('admin/login',{layout:null});
    });

    /**
     * 后台注销
     */
    app.get('/logout', function(req, res) {
        if ( req.session.user)
            delete req.session.user;
        req.logout();
        res.redirect('/login');
    });

    /**
     * 微信授权回调
     */
    app.get('/wx/auth', function(req, res) {
        var app_id = credentials.wx.appId;
        var url = 'http://base_wx.ompchina.net/sns/UserInfo?appId='+app_id+'&openid='+req.query.openid;
        //console.log(app_id,req.query);
        request.get({url:url,json:true},function (error,response,body) {
            if (!error && response.statusCode == 200) {
                if (body.errcode){
                    req.write('something bad~'+body.message);
                    return;
                }
                req.session.wxUser = {
                    openid:body.openid,
                    nickname:body.nickname,
                    headImg: body.headimgurl,
                    gender: body.sex,
                    province: body.province,
                    city: body.city,
                    country: body.country,
                    created: Date.now()
                };
                WxUser.findOneAndUpdate({openid:body.openid},{
                    nickname: body.nickname,
                    headImg: body.headimgurl,
                    gender: body.sex,
                    province: body.province,
                    city: body.city,
                    country: body.country,
                    created: Date.now()
                },{upsert:true},function (error,doc) {
                    console.log(error, doc);

                });
                res.redirect('/');
            }
            else{
                console.log('授权失败~');
            }

        })
    });
};

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}
var wxAuth = function (req, res, next) {
    if (req.session.wxUser){
        return next();
    }
    var app_id = credentials.wx.appId;
    var callback_url = 'http://' + credentials.hostname + '/wx/auth';
    var url = 'http://base_wx.ompchina.net/sns/oauth2?appid='+ app_id +'&redirecturl='+ callback_url +'&oauthscope=snsapi_userinfo';
    res.redirect(url);
}