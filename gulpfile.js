var gulp = require('gulp')
 , path = require('path')
 , connect = require('connect')
 , http = require('http')
 , gutil = require('gulp-util')
 , less = require('gulp-less')
 , autoprefixer = require('gulp-autoprefixer')
 , minifycss = require('gulp-minify-css')
 , imagemin = require('gulp-imagemin')
 , uglify = require('gulp-uglify')
 , rename = require('gulp-rename')
 , clean = require('gulp-clean')
 , concat = require('gulp-concat')
 , uncss = require('gulp-uncss-task')
 , cache = require('gulp-cache')
 , htmlmin = require('gulp-htmlmin')
 , livereload = require('gulp-livereload')
 , lr = require('tiny-lr')
 , server = lr()


gulp.task('styles', function() {
	return gulp.src('app/less/main.less')
		.pipe(less({
			paths: [ path.join(__dirname, 'app/bower_components/bootstrap/less/') ]
		}))
		.pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
		.pipe(gulp.dest('dist/css'))
		.pipe(uncss({
			html: ['app/index.html'],
			csspath: '../dist/'
		}))
		.pipe(minifycss())
		.pipe(livereload(server))
		.pipe(gulp.dest('dist/css'))
});

gulp.task('scripts', function() {
	return gulp.src('app/js/**/*.js')
		.pipe(concat('main.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uglify())
		.pipe(livereload(server))
		.pipe(gulp.dest('dist/js'))
});

gulp.task('images', function() {
	return gulp.src('app/img/**/*')
		.pipe(cache(imagemin({
			optimizationLevel: 3,
			progressive: true,
			interlaced: true
		})))
		.pipe(livereload(server))
		.pipe(gulp.dest('dist/img'))
});


gulp.task('html', function() {
	return gulp.src('app/index.html')
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(livereload(server))
		.pipe(gulp.dest('dist/'));
});

gulp.task('fonts', function() {
	return gulp.src(['app/bower_components/bootstrap/fonts/*'])
		.pipe(gulp.dest('dist/fonts/'));
})

gulp.task('clean', function() {
	return gulp.src(['dist/css', 'dist/js', 'dist/img', 'dist/fonts'], { read: false })
		.pipe(clean());
});

gulp.task('default', ['clean'], function() {
	gulp.start('styles', 'scripts', 'images', 'fonts', 'html');
});


gulp.task('watch', ['styles', 'scripts', 'images', 'html', 'fonts'], function() {

	var middleware = [
		require('connect-livereload')({ port: 35729 }),
		connect.static('dist/'),
		connect.directory('dist/')
	];

	var app = connect.apply(null, middleware);
	var httpServer = http.createServer(app);

	httpServer
		.listen(9000)
		.on('listening', function() {
			console.log('Started listening');
		});

	server.listen(35729, function(err) {
		if (err) console.log(err);
	});

	gulp.watch('app/less/**/*.less', ['styles']);
	gulp.watch('app/js/**/*.js', ['scripts']);
	gulp.watch('app/img/**/*', ['images']);
	gulp.watch('app/fonts/**/*', ['fonts']);
	gulp.watch('app/index.html', ['html']);
})
