module.exports = function(grunt){
	var yjdlib = '../jsyjdlib/lib/yjd';
	var files = {
		thirdCss: [
			// '3rd/jquery-ui/jquery-ui.min.css',
			// '3rd/gridstack/gridstack.min.css',
		],
		thirdJs:	[
			// '3rd/jquery/jquery.min.js',
			// '3rd/jquery-ui/jquery-ui.min.js',
			// '3rd/lodash/lodash.min.js',
			'3rd/ckeditor/ckeditor.js',
		],
		thirdRelative:	[
			'3rd/ckeditor/styles.js',
			'3rd/ckeditor/contents.css',
			'3rd/ckeditor/skins/moono-lisa/**',
			'3rd/ckeditor/lang/**',
			'3rd/ckeditor/plugins/**',
		],
		thirdFonts: [
			'3rd/font-awesome/fonts/fontawesome-webfont.eot',
			'3rd/font-awesome/fonts/fontawesome-webfont.ttf',
			'3rd/font-awesome/fonts/fontawesome-webfont.woff',
			'3rd/font-awesome/fonts/fontawesome-webfont.woff2',
		],
		thirdConf:	[
			'src/ckeditor/config.js',
		],
		srcYjd:	[
			yjdlib + '/base.js',
			yjdlib + '/str.js',
			yjdlib + '/ajax.js',
			yjdlib + '/atm.js',
			yjdlib + '/loader.js',
			yjdlib + '/wdg/wdg.js',
			yjdlib + '/wdg/menu.js',
			yjdlib + '/wdg/statusbar.js',
		],
		srcJs:	[
			'src/js/app.js',
			'src/js/book.js',
			'src/js/appMenus.js',
			'src/js/sectionMenu.js',
			'src/js/editor/editor.js',
			'src/js/editor/textEditor.js',
			'src/js/main.js'
		],
		distJs:	[
			'tmp/weflnote.min.js'
		],
		wdgCss:	[
			yjdlib + '/wdg/theme.css',
			yjdlib + '/wdg/wdg.css',
			yjdlib + '/wdg/menu.css',
			yjdlib + '/wdg/statusbar.css',
		],
		devCss:	[
			'dev/css/yjdwdg.css',
			'dev/css/weflnote.css'
		],
		distCss:	[
			'dist/css/weflnote.min.css'
		],
		content:	[
			'src/content/envelope.html',
			'src/content/content2.html',
			'src/content/content.html',
			'src/content/content.css',
			'src/content/content.js',
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
				laxbreak:	true,
				sub:		true,
				esversion: 5
			},
			files:	[	'src/**/*.js', 'grunttasks/*.js'	]
		},
		concat: {
			'apps.js' : {
				options: {
					stripBanners: true,
//					banner: "var yjd ={};\r\n\r\n",
					sourceMap:	true
				},
				dest: 'tmp/<%= pkg.name %>.js',
				src: [	files.srcYjd, files.srcJs	]
			},
			'yjdwdg.css' : {
				options: {
					stripBanners: false,
					sourceMap:	true
				},
				dest: 'dev/css/yjdwdg.css',
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
					sourceMap:		true
				},
				files: {
					'dev/css/<%= pkg.name %>.css':	'src/css/<%= pkg.name %>.scss'
				}
			},
			'apps.min.css': {
				options: {
					outputStyle:	'compressed',
					sourceMap:		true
				},
				files: {
					'dist/css/<%= pkg.name %>.min.css':	'src/css/<%= pkg.name %>.scss'
				}
			},
		},

		scriptHtml: {
			'scripts.html':	{
				options: {
					query:	'i',
					script: '',
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
					script: '',
					replace:	{
						'^3rd\/':	'js/',
						'^..\/':	'../../',
						'^tmp\/':	'../tmp/',
						'^src\/':	'../src/',
						'^dev\/':	'./',
					},
				},
//				src:	[ files.thirdCss, files.distCss, files.thirdJs, 'tmp/<%= pkg.name %>.js' ],
				src:	[ files.thirdCss, files.devCss, files.thirdJs, files.srcYjd, files.srcJs ],
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
					{	expand:	true, cwd: '3rd/font-awesome/fonts/',
						src:	[
							files.get('thirdFonts', /^3rd\/font\-awesome\/fonts\//, ''),
						],
						dest:	'dev/css/fonts'
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
	grunt.task.loadTasks('../jsyjdlib/tasks');
	grunt.loadNpmTasks('grunt-devtools');

	grunt.registerTask('default', ['clean', 'all', 'watch']);
	grunt.registerTask('all', grunt.config.get('makeWatch').allTargets);
}
