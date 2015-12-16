var express = require('express');
var main = require('./router/main');
var shell = require('./router/shell');

var app = express();

var server = app.listen(6500, function() {
    console.log("Server started");
});

main(app);
shell(app);

app.engine('html', require('ejs').renderFile);
app.engine('js', require('ejs').renderFile);
