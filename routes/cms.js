var paginate = require('express-paginate'),
    User = require('../models/user.js'),
    workHandler = require('../handlers/cms/work.js'),
    wxHandler = require('../handlers/cms/wx.js');
    gameHandler = require('../handlers/cms/game.js');
module.exports = function(app) {
    //后台首页
    app.use(paginate.middleware(10, 50));
    app.get('/cms', isAuthenticated,function (req,res) {
        res.render('cms/dashboard',{layout:'cms',user:req.user,active: { dashboard: true }});
    });

    //游戏记录
    app.get('/cms/games', isAuthenticated, gameHandler.list);

    //微信授权用户
    app.get('/cms/wxusers', isAuthenticated, wxHandler.list);
    //作品查看
    app.get('/cms/works', isAuthenticated, workHandler.list);

    //作品修改
    app.get('/cms/work/edit/:id', isAuthenticated, workHandler.edit);
    //案例增加
    app.get('/cms/work/add', isAuthenticated, workHandler.add);
    //案例\项目post
    app.post('/upload/:id', isAuthenticated, workHandler.post);
    app.delete('/cms/work/:id', workHandler.delete);

    //后台登录
    app.get('/login', function(req, res) {
        res.render('cms/login',{layout:null,message:req.flash('message')});
    });

    //后台注销
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/login');
    });

// initialize vacations
    User.find(function(err, users){
        if(users.length) return;

        new User({
            username: 'admin',
            password: '790220460cea4fee993f568191be1e451e18d16d',
            email: 'lori.w@live.cn',
            role: 'ADMIN',
            created: Date.now()
        }).save();

    });
};

var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}
