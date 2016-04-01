var http = require('http'),
    express = require('express');
var app = express();
var credentials = require('./credentials.js');
// set up handlebars view engine
var paginateHelper = require('express-handlebars-paginate');
var handlebars = require('express-handlebars');
var hbs = handlebars.create({
    defaultLayout:'main',
    helpers: {
        static: function(name) {
            return require('./lib/static.js').map(name);
        },
        section: function(name, options){
            if(!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
})
hbs.handlebars.registerHelper('paginateHelper', paginateHelper.createPagination);
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 4000);

app.use(require('connect-flash')());
var MongoSessionStore = require('session-mongoose')(require('connect'));
var sessionStore = new MongoSessionStore({ url: credentials.mongo[app.get('env')].connectionString });
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')({
    store: sessionStore,
    secret: credentials.cookieSecret,
    resave: false,
    saveUninitialized: true,
}));

// database configuration
var mongoose = require('mongoose');
var options = {
    server: {
        socketOptions: { keepAlive: 1 }
    }
};
switch(app.get('env')){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, options);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, options);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}

require('./routes/index.js')(app);
var auth = require('./lib/auth.js')(app);
auth.init();
auth.registerRoutes();
require('./routes/cms.js')(app);

var User = require('./models/user.js');
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



// 404 catch-all handler (middleware)
app.use(function(req, res, next){
    res.status(404);
    res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

var server;

function startServer() {
    server = http.createServer(app).listen(app.get('port'), function(){
        console.log( 'Express started in ' + app.get('env') +
            ' mode on http://localhost:' + app.get('port') +
            '; press Ctrl-C to terminate.' );
    });
}
module.exports = startServer;
if(require.main === module){
    // application run directly; start app server
    startServer();
} else {
    // application imported as a module via "require": export function to create server
    module.exports = startServer;
}
