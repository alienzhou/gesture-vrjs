var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('demo', function() {
  	gulp.src('./app/js/index.js')
    	.pipe($.webpack(require('./webpack.config.js')))
    	.pipe(gulp.dest('dist/'));

	gulp.src('./app/less/*')
		.pipe($.less())
		.pipe($.cssmin())
		.pipe($.autoprefixer())
		.pipe(gulp.dest('dist/'));

	gulp.src('app/*.html')
		.pipe(gulp.dest('dist/'));
});

gulp.task('trasl', function () {
	gulp.src('static/less/*')
		.pipe($.less())
		.pipe($.cssmin())
		.pipe($.autoprefixer())
		.pipe(gulp.dest('build/static/css'));

	gulp.src('static/vrsk/less/*')
		.pipe($.less())
		.pipe($.cssmin())
		.pipe($.autoprefixer())
		.pipe(gulp.dest('build/static/vrsk/css'));
});

gulp.task('compress', function () {
	gulp.src('static/js/carousel.js')
		.pipe($.babel({
            presets: ['es2015'],
			minified: true
		}))
		.pipe(gulp.dest('build/static/js'));

	gulp.src('static/vrsk/js/*')
		.pipe($.babel({
			minified: true
		}))
		.pipe(gulp.dest('build/static/vrsk/js'));
	
	gulp.src('static/js/lib/*')
		.pipe($.babel({
			minified: true
		}))
		.pipe(gulp.dest('build/static/js/lib'));
});

gulp.task('copy', function () {
	gulp.src('static/*.html')
		.pipe(gulp.dest('build/static'));

	gulp.src('static/vrsk/*.html')
		.pipe(gulp.dest('build/static/vrsk'));

	gulp.src('app.js')
		.pipe(gulp.dest('build'));
	
    gulp.src('static/js/vendor/zepto.1.2.0.min.js')
		.pipe(gulp.dest('build/static/js/vendor'));

	gulp.src('static/images/*')
		.pipe(gulp.dest('build/static/images'));
});