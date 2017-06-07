var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var useragent = require('express-useragent');

app.use('/static', express.static('static'));
app.use('/node_modules', express.static('node_modules'));
app.use(useragent.express());


app.get('/', function (req, res) {
    res.sendFile(__dirname + '/static/index.html');
});

app.get('/*', function (req, res) {
    if (req.originalUrl === '/vrsk/view' && req.useragent.isMobile) {
        res.sendFile(__dirname + '/static/' + req.originalUrl + 'M.html');
    }
    res.sendFile(__dirname + '/static/' + req.originalUrl + '.html');
});

io.on('connection', function (socket) {
    console.log('connected');
    socket.on('disconnect', function () {
        console.log('disconnected');
    })
});

io.on('connection', function (socket) {
    socket.on('gesture', function (gesture) {
        console.log(gesture.direction);
        io.emit('gesture', gesture);
    });
});

var server = http.listen(8085, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});