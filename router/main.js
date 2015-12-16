function paths(app) {

    app.get('/', index);
    app.get('/index.html', index);

    function index(req, res) {
        res.render('index.html');
    }

    app.get('/channels.js', function(req, res) {
        res.render('channels.js');
    });

    app.get('/hls.js', function(req, res) {
        res.render('hls.js');
    });
}

module.exports = paths;
