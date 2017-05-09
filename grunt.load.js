//	Libraries to be loaded.
//	This file required in Gruntfile.js
//	Type "grunt loadLib" to get libraries

module.exports = {
	jquery: {
		options:	{
			rename:	{
				'3rd/jquery/jquery-3.2.1.min.js':	'3rd/jquery/jquery.min.js',
				'3rd/jquery/jquery-3.2.1.js':	'3rd/jquery/jquery.js',
			}
		},
		baseurl:	'https://code.jquery.com/',
		url:	[
			'jquery-3.2.1.min.js',
			'jquery-3.2.1.js'
		],
		dest:	'3rd/jquery/',
	},
	gridstack:	{
		baseurl:	'https://github.com/troolee/gridstack.js/raw/v0.2.6/dist/',
		url:	[
			'gridstack.js',
			'gridstack.min.js',
			'gridstack.css',
			'gridstack.min.css',
		],
		dest:	'3rd/gridstack/'
	},
	lodash:	{
		baseurl:	'https://raw.githubusercontent.com/lodash/lodash/4.17.4/dist/',
		url:	[
			'lodash.js',
			'lodash.min.js'
		],
		dest:	'3rd/lodash/'
	},
	'jquery-ui':	{
		options:	{
			unzip:	true,
			rename:	{
				'3rd/jquery-ui-1.12.1':	'3rd/jquery-ui',
			}
		},
		url:	'http://jqueryui.com/resources/download/jquery-ui-1.12.1.zip',
		dest:	'3rd/'
	},
	ckeditor:	{
		options:	{
			unzip:	true
		},
		url:	'http://download.cksource.com/CKEditor/CKEditor/CKEditor%204.6.2/ckeditor_4.6.2_full.zip',
		dest:	'3rd/'
	}
};
