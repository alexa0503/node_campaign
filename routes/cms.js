var request = require('request'),
    url = require('url'),
    credentials = require('../credentials.js'),
    WxUser = require('../models/wxUser.js'),
    paginate = require('express-paginate'),
    moment = require('moment'),
    User = require('../models/user.js'),
    Case = require('../models/case.js'),
    formidable = require('formidable'),
    fs = require('fs'),
    path = require('path'),
    util = require('util');
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
            console.log(paginate.href);
            res.render('cms/wxusers', context);
        })
    });
    //案例查看
    app.get('/cms/cases', isAuthenticated, function (req, res, next) {
        var context = {
            layout:'cms',
            user:req.user,
            active: { caseParent:true, caseView: true },
            title: '案例查看'
        };
        var limit = 20;
        Case.paginate({},{page:req.query.page, limit:limit},function (err,result) {
            //if (err) return handleError(err);
            if (err) next(err);
            context.cases = result.docs.map(function (item) {
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
            context.pagination = { page: result.page, limit:limit,totalRows: result.total };
            console.log(paginate.href);
            res.render('cms/cases', context);
        })
    });

    //案例修改
    app.get('/cms/case/edit/:id', isAuthenticated, function (req, res) {
        Case.findById(req.params.id,function (err, result) {
            if (err) next(err);
            //console.log(result,req.params.id);
            var context = {
                layout:'cms',
                user:req.user,
                active: { caseParent:true },
                title: '案例修改',
                case: result,
                formUrl: '/upload/'+req.params.id,
            };
            res.render('cms/case_form', context);
        });

    });
    //案例增加
    app.get('/cms/case/add', isAuthenticated, function (req, res) {
        var context = {
            layout:'cms',
            user:req.user,
            active: { caseParent:true, caseAdd: true },
            title: '新增案例',
            formUrl: '/cms/case/add'
        };
        res.render('cms/case_form', context);
    });
    //案例\项目post
    app.post('/cms/case/add', function (req,res) {
        var form = new formidable.IncomingForm();
        var tmpDir = path.join(__dirname, '../public/uploads/tmp/');
        form.uploadDir = tmpDir//文件保存的临时目录为当前项目下的tmp文件夹
        //form.uploadDir = './public/uploads/';
        form.maxFieldsSize = 16*1024*1024;  //图片大小限制为最大1M
        form.keepExtensions = true;        //使用文件的原扩展名
        if (!fs.existsSync(tmpDir)) {
            fs.mkdir(tmpDir);
        }
        form.parse(req, function(err, fields, file) {
            console.log(fields);
            var filePath = '';

            filePath = file.imgFile.path;
            var targetDir = path.join(__dirname, '../public/uploads/');
            console.log(__dirname,targetDir);
            if (!fs.existsSync(targetDir)) {
                fs.mkdir(targetDir);
            }
            var fileExt = filePath.substring(filePath.lastIndexOf('.'));
            //判断文件类型是否允许上传
            if (('.jpg.jpeg.png.gif').indexOf(fileExt.toLowerCase()) === -1) {
                //var err = new Error('此文件类型不允许上传');
                res.json({code:-1, message:'此文件类型不允许上传'});
            } else {
                //以当前时间戳对上传文件进行重命名
                var fileName = new Date().getTime() + fileExt;
                var targetFile = path.join(targetDir, fileName);
                //移动文件
                fs.rename(filePath, targetFile, function (err) {
                    if (err) {
                        console.info(err);
                        res.json({code:-1, message:'操作失败'});
                    } else {
                        //上传成功，返回文件的相对路径
                        var fileUrl = '/uploads/' + fileName;
                        res.json({code:0, fileUrl:fileUrl});

                    }
                });
                process.nextTick(function(){
                    fs.unlink(filePath, function(err) {
                        if (err) {
                            console.info("删除上传时生成的临时文件失败");
                            console.info(err);
                        } else {
                            console.info("删除上传时生成的临时文件");
                            var data = {
                                title: fields.title,
                                desc: fields.desc,
                                link: fields.link,
                                imgPath: fileName
                            };
                            new Case(data).save();
                        }
                    });
                });
            }
        });
    });
    app.get('/cms/case/delete/:id', function (req, res) {
        Case.remove({ _id: req.params.id }, function(err) {
            if (err)
                res.json({code:-1, message:'失败'});
            res.json({code:0, message:''});
        });
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