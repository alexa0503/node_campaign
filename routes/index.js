var WxUser = require('../models/wxUser.js'),
    request = require('request'),
    url = require('url'),
    credentials = require('../credentials.js');
module.exports = function(app) {
    /**
     * 首页
     */
    app.get('/', wxAuth, function(req, res) {
        res.render('index',{user:req.session.wxUser});
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
                    created: Date.now(),
                    createdIp:req.headers['x-forwarded-for'] || req.connection.remoteAddress
                };
                WxUser.findOneAndUpdate({openid:body.openid},{
                    nickname: body.nickname,
                    headImg: body.headimgurl,
                    gender: body.sex,
                    province: body.province,
                    city: body.city,
                    country: body.country,
                    created: Date.now(),
                    createdIp:req.headers['x-forwarded-for'] || req.connection.remoteAddress
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
var wxAuth = function (req, res, next) {
    if (req.session.wxUser){
        return next();
    }
    var app_id = credentials.wx.appId;
    var callback_url = 'http://' + credentials.hostname + '/wx/auth';
    var url = 'http://base_wx.ompchina.net/sns/oauth2?appid='+ app_id +'&redirecturl='+ callback_url +'&oauthscope=snsapi_userinfo';
    res.redirect(url);
}