var index = require('../model/index.js');
var util = require('../lib/util.js');

module.exports = function(req, res){
    var title = req.query.title || 'example';
    res.render('home/page/index.tpl', index.getData(title));
};