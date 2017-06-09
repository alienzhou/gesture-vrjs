var path = require('path');
var webpack = require('webpack');

module.exports = {
    entry: './app/js/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [{
            test: /\.less$/,
            loaders: ['style', 'css', 'less']
        }]
    }
};
