/**
 * Created by Alexa on 16/4/18.
 */
var credentials = require('../credentials.js'),
    moment = require('moment'),
    wxUser = require('../models/wxUser'),
    sign = require('../lib/sign');
exports.auth = function(req, res) {
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
};
exports.share = function (req,res) {
    var appId = credentials.wx.appId;
    if ( !req.query.url)
        res.json({ret:1000,msg:'请传入URL'});
    var ticket = sign('jsapi_ticket', req.query.url);
}
