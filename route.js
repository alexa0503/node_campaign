var WxUser = require('./models/wxUser.js'),
    request = require('request'),
    url = require('url'),
    credentials = require('./credentials.js');
module.exports = function(app) {

    /**
     * 首页
     */
    app.get('/', wxAuth, function(req, res) {
        console.log(req.url,req.host);
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
        var url = 'http://base_wx.ompchina.net/sns/UserInfo?appId='+app_id+'&openid='+req.get('wechat_openid');
        request.get(url,function (error,respons,body) {
            if (!error && response.statusCode == 200) {
                var data = body;
                req.session.wxUser = {
                    openid:data.openid,
                    nickname:data.nickname,
                    headImg: data.headimgurl,
                    gender: data.sex,
                    province: data.province,
                    city: data.city,
                    country: data.country,
                };
                WxUser.findOneAndUpdate({openid:data.openid},{
                    nickname: data.nickname,
                    headImg: data.headimgurl,
                    gender: data.sex,
                    province: data.province,
                    city: data.city,
                    country: data.country,
                },function (err,wxUser) {
                    req.session.wxUser = wxUser.openid;
                    if( !wxUser.length){
                        new WxUser({
                            openid: data.openid,
                            nickname: data.nickname,
                            headImg: data.headimgurl,
                            gender: data.sex,
                            province: data.province,
                            city: data.city,
                            country: data.country,
                            created: Date.now()
                        }).save();
                    }
                })
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