var credentials = require('../credentials.js'),
    main = require('../handlers/main.js'),
    wx = require('../handlers/wx.js'),
    paginate = require('express-paginate'),
    apiController = require('../controllers/api');
module.exports = function(app) {
    //app.use(paginate.middleware(10, 50));
    //首页
    app.get('/', main.home);
    //作品展示
    app.get('/works', main.works);

    /**
     * 微信授权回调
     */
    app.get('/wx/auth', wx.auth);
    //api接口
    apiController.registerRoutes(app);
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