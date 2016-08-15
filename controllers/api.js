/**
 * Created by Alexa on 16/4/18.
 */
module.exports = {
    registerRoutes: function (app) {
        app.get('/api/share', this.share);
    },
    share: function (req, res, next) {
        //if (err) next();
        res.json({code:0,data:'good'});
    }
}