var express = require('express');
var app = express();

app.use('/static', express.static('static'));

app.get('/', function (req, res) {
    var html = '<h1>目录</h1>'
                + '<div><a href="static/imgtest.html" target="_blank">实验</a></div>'
                + '<div><a href="static/cube.html" target="_blank">CSS 3D</a></div>'
                + '<div><a href="static/carousel.html" target="_blank">VR手势操控</a></div>'
  res.send(html);
});

var server = app.listen(8085, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});