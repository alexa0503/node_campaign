/**
 * Created by Alexa on 16/4/18.
 */
var Work = require('../../models/work.js'),
    fs = require('fs'),
    path = require('path'),
    util = require('util'),
    formidable = require('formidable'),
    moment = require('moment');
exports.list = function (req, res, next) {
    var context = {
        layout:'cms',
        user:req.user,
        active: { workParent:true, workView: true },
        title: '作品查看'
    };
    var limit = 20;
    Work.paginate({},{page:req.query.page, limit:limit},function (err,result) {
        //if (err) return handleError(err);
        if (err) next(err);
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
        context.pagination = { page: result.page, limit:limit,totalRows: result.total };
        res.render('cms/works', context);
    })
};
exports.edit = function (req, res) {
    Work.findById(req.params.id,function (err, result) {
        if (err) next(err);
        //console.log(result,req.params.id);
        var context = {
            layout:'cms',
            user:req.user,
            active: { workParent:true },
            title: '作品修改',
            work: result,
            formUrl: '/upload/'+req.params.id,
        };
        res.render('cms/work_form', context);
    });

};
exports.delete = function (req, res) {
    Work.remove({ _id: req.params.id }, function(err) {
        if (err)
            res.json({code:-1, message:'失败'});
        res.json({code:0, message:''});
    });
};
exports.add = function (req, res) {
    var context = {
        layout:'cms',
        user:req.user,
        active: { workParent:true, workAdd: true },
        title: '新增案例',
        formUrl: '/upload/add'
    };
    res.render('cms/work_form', context);
};
exports.post = function (req,res) {
    var form = new formidable.IncomingForm();
    form.uploadDir = '/tmp/';//文件保存的临时目录为当前项目下的tmp文件夹
    form.maxFieldsSize = 16*1024*1024;  //图片大小限制为最大1M
    form.keepExtensions = true;        //使用文件的原扩展名

    form.parse(req, function(err, fields, file) {
        //console.log(fields);
        var filePath = '';
        if(file.imgFile && file.imgFile.size > 0){
            filePath = file.imgFile.path;
            var targetDir = path.join(__dirname, '../public/uploads/');
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
                        var data = {
                            title: fields.title,
                            desc: fields.desc,
                            link: fields.link,
                            imgPath: fileName,
                            createdTime: Date.now(),
                            createdIp:  req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip
                        };
                        if ( 'add' == req.params.id){
                            new Work(data).save();
                        }
                        else{
                            Work.findOneAndUpdate({_id:req.params.id}, data, {upsert:true}, function(err, doc){
                                if (err)
                                    res.json({code:-1, message:'数据操作失败'});
                            });
                        }
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
                        }
                    });
                });

            }
        }
        else{
            if ( 'add' == req.params.id ){
                res.json({code:-1, message:'图片不能为空'});
            }
            else{
                Work.findById(req.params.id,function (err, result) {
                    result.title = fields.title;
                    result.desc = fields.desc;
                    result.link = fields.link;
                    result.createdTime = Date.now();
                    result.createdIp = req.get("X-Real-IP") || req.get("X-Forwarded-For") || req.ip;
                    result.save(function (err) {
                        if (err)
                            res.json({code:-1, message:'数据操作失败'});
                        res.json({code:0, message:''});
                    })
                })
            }
        }
    });
};
