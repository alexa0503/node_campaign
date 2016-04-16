var WxUser = require('../models/wxUser.js'),
    Case = require('../models/work.js'),
    request = require('request'),
    url = require('url'),
    moment = require('moment'),
    credentials = require('../credentials.js');
module.exports = function(app) {

    //首页
    app.get('/', function(req, res, next) {

        var wxShare = {};
        wxShare.appId = credentials.wx.appId;
        wxShare.url = credentials.wx.url;
        wxShare.title = '微信分享标题';
        wxShare.desc = '微信分享描述';
        wxShare.link = 'http://'+credentials.hostname;
        wxShare.imgUrl = 'http://'+credentials.hostname+'/images/share.jpg';
        Case.find().sort({'_id':-1}).limit(6).exec(function (err,result) {
            //if (err) return handleError(err);
            if (err) next(err);
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
            res.render('index',{user:req.session.wxUser,wxShare:wxShare,works:works});
        })

    });


    /**
     * 微信授权回调
     */
    app.get('/wx/auth', function(req, res) {
        var app_id = credentials.wx.appId;
        var url = credentials.wx.url+'/sns/UserInfo?appId='+app_id+'&openid='+req.query.openid;
        request.get({url:url,json:true},function (error,response,body) {
            if (!error && response.statusCode == 200) {
                if (body.errcode){
                    req.write('something bad~'+body.message);
                    return;
                }
                var data = {
                    nickname: body.nickname,
                    headImg: body.headimgurl,
                    gender: body.sex,
                    province: body.province,
                    city: body.city,
                    country: body.country,
                    created: Date.now(),
                    createdIp:req.ip//headers['x-forwarded-for'] || req.connection.remoteAddress
                };
                req.session.wxUser = data;
                req.session.wxUser.openid = body.openid;
                WxUser.findOneAndUpdate({openid:body.openid},data,{upsert:true},function (error,doc) {
                    console.log(error, doc);
                });
                res.redirect('/');
            }
            else{
                req.write('something bad~');
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
    var url = credentials.wx.url+'/sns/oauth2?appid='+ app_id +'&redirecturl='+ callback_url +'&oauthscope=snsapi_userinfo';
    res.redirect(url);
}