// Make express use ejs for rendering views
app.set('view engine', 'ejs');

// trust first proxy
app.set('trust proxy', 1);

// change default views directory
app.set('views', __dirname + '/src/server/views');

// use helmet to establish hsts
app.use(helmet.hsts({
    maxAge: 31536000000,
    includeSubdomains: true,
    force: true
}));

// home path
app.get('/', function (req, res, next) {
    res.render('index.ejs');
});

// Express server static files for public folder
app.use(express.static('app'));
