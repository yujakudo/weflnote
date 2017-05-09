module.exports = function(grunt){
	var files = {
		thirdCss: [
			'3rd/jquery-ui/jquery-ui.min.css',
			'3rd/gridstack/gridstack.min.css',
		],
		thirdJs:	[
			'3rd/jquery/jquery.min.js',
			'3rd/jquery-ui/jquery-ui.min.js',
			'3rd/lodash/lodash.min.js',
			'3rd/ckeditor/ckeditor.js',
		],
		thirdRelative:	[
			'3rd/ckeditor/styles.js',
			'3rd/ckeditor/skins/moono-lisa/**',
			'3rd/ckeditor/lang/**',
			'3rd/ckeditor/plugins/scayt/**',
			'3rd/ckeditor/plugins/wsc/**',
			'3rd/ckeditor/plugins/copyformatting/**',
		],
		thirdConf:	[
			'src/ckeditor/config.js',
		],
		srcYjd:	[
			'src/js/yjd/str.js',
			'src/js/yjd/atm.js',
			'src/js/yjd/loader.js',
			'src/js/yjd/wdg/wdg.js',
			'src/js/yjd/wdg/menu.js',
		],
		srcJs:	[
			'src/js/app.js',
			'src/js/book.js',
			'src/js/main.js'
		],
		distJs:	[
			'tmp/weflnote.min.js'
		],
		wdgCss:	[
			'src/js/yjd/wdg/theme.css',
			'src/js/yjd/wdg/wdg.css',
			'src/js/yjd/wdg/menu.css',
		],
		distCss:	[
			'tmp/yjdwdg.css',
			'tmp/weflnote.min.css'
		],
		content:	[
			'src/content/content.html',
			'src/content/content.css',
		],
		partHtml:	[
			'src/app-nav.html',
		],
		get: function(name, pattern, s_replace) {
			if(!pattern)	return this[name];
			return this[name].map(function(fn){
				return fn.replace(pattern, s_replace);
			});
		},
		getAbs: function(name) {
			return this[name].map(function(fn){
				return __dirname+'/'+fn;
			});
		}
	};
	var load = require('./grunt.load.js');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		loadLib: load,
		jshint:	{
			options: {
				laxbreak:	false,
				esversion: 5
			},
			files:	[	'src/**/*.js', 'grunttasks/*.js'	]
		},
		concat: {
			'apps.js' : {
				options: {
					stripBanners: true,
					banner: "var yjd ={};\r\n\r\n",
				},
				dest: 'tmp/<%= pkg.name %>.js',
				src: [	files.srcYjd, files.srcJs	]
			},
			'yjdwdg.css' : {
				options: {
					stripBanners: true,
				},
				dest: 'tmp/yjdwdg.css',
				src: [	files.wdgCss	]
			},
		},
		uglify:	{
			'apps.min.js': {
				src:	'tmp/<%= pkg.name %>.js',
				dest:	'tmp/<%= pkg.name %>.min.js'
			}
		},
		sass: {
			'apps.css': {
				options: {
					outputStyle:	'expanded',
				},
				files: {
					'tmp/<%= pkg.name %>.css':	'src/css/<%= pkg.name %>.scss'
				}
			},
			'apps.min.css': {
				options: {
					outputStyle:	'compressed',
				},
				files: {
					'tmp/<%= pkg.name %>.min.css':	'src/css/<%= pkg.name %>.scss'
				}
			},
		},

		scriptHtml: {
			'scripts.html':	{
				options: {
					query:	'i',
					script: 'var yjd={}, WN={};',
					replace:	{
						'^3rd\/':	'js/',
						'^tmp\/(.*\.css)$': function(str){
							return 'css/'+RegExp.$1;
						},
						'^tmp\/(.*\.js)$': function(str){
							return 'js/'+RegExp.$1;
						},
					},
				},
				src:	[ files.thirdCss, files.distCss, files.thirdJs, files.srcYjd, files.distJs ],
				dest:	'tmp/scripts.html'
			},
			'scripts.dev.html':	{
				options: {
					query:	false,
					tag:	'<meta http-equiv="Cache-Control" content="no-cache"/>',
					script: 'var yjd={}, WN={};',
					replace:	{
						'^3rd\/':	'js/',
						'^tmp\/':	'../tmp/',
						'^src\/':	'../src/',
					},
				},
				src:	[ files.thirdCss, files.distCss, files.thirdJs, files.srcYjd, files.srcJs ],
				dest:	'tmp/scripts.dev.html'
			},
		},
		ect: {
			'dist/index.html': {
				variables: {
					version: '<%= pkg.version %>',
					scripts: __dirname+'/tmp/scripts.html',
					title:	'<%= pkg.name %>',
				},
				src: 'src/index.html',
				dest: 'dist/index.html',
			},
			'dev/index.html': {
				variables: {
					version: '<%= pkg.version %>',
					scripts: __dirname+'/tmp/scripts.dev.html',
					title:	'<%= pkg.name %>',
				},
				src: 'src/index.html',
				dest: 'dev/index.html',
			},
		},
		copy: {
			dev_3rd:	{
				files:	[
					{	expand:	true, cwd: '3rd',
						src:	[
							files.get('thirdJs', /^3rd\//, ''),
							files.get('thirdCss', /^3rd\//, ''),
						],
						dest:	'dev/js/'
					},
					{	expand: true, cwd: '3rd',
						src:	[
							files.get('thirdRelative', /^3rd\//, ''),
						],
						dest:	'dev/js/'
					},
					{	expand:	true, cwd: 'src',
						src:	[
							files.get('thirdConf', /^src\//, ''),
						],
						dest:	'dev/js/'
					},
				],
			},
			dev:	{
				expand:	true,
				cwd:	'src/',
				src:	[
					files.get('content', /^src\//, ''),
					files.get('partHtml', /^src\//, ''),
				],
				dest:	'dev/'
			},
		},
		clean: [ 'tmp/*', 'tmp/*/*', 'dist/*', 'dev/*'	],
		makeWatch:	{
			options: {
				gruntfile:	'Gruntfile.js',
				watchfile:	'tmp/grunt.watch.json',
				dependency:	{
					ect:	[
						'variables:scripts',
					],
				},
			},
//			tasks:	[	'concat', 'ect'	],
//			except:	[	'scriptHtml'	],
		},
		watch:	{
			scriptHtml: {
				files: [	'Gruntfile.js'	],
				tasks: [	'scriptHtml'	]
			},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-sass');
	grunt.loadNpmTasks('grunt-ect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.task.loadTasks('grunttasks');

	grunt.registerTask('default', ['clean', 'all', 'watch']);
	grunt.registerTask('all', grunt.config.get('makeWatch').allTargets);
}
