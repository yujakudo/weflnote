//	Libraries to be loaded.
//	This file required in Gruntfile.js
//	Type "grunt loadLib" to get libraries

module.exports = {
/*	jquery: {
		options:	{
			rename:	{
				'3rd/jquery/jquery-3.2.1.min.js':	'3rd/jquery/jquery.min.js',
				'3rd/jquery/jquery-3.2.1.js':	'3rd/jquery/jquery.js',
			}
		},
		baseurl:	'https://code.jquery.com/',
		url:	[
			'jquery-3.2.1.min.js',
			'jquery-3.2.1.js',
			'https://github.com/jquery/jquery/raw/3.2.1/LICENSE.txt'
		],
		dest:	'3rd/jquery/',
	},
	gridstack:	{
		options:	{
			rename:	{
				'3rd/gridstack/LICENSE':	'3rd/gridstack/LICENSE.txt',
			}
		},
		baseurl:	'https://github.com/troolee/gridstack.js/raw/v0.2.6/dist/',
		url:	[
			'gridstack.js',
			'gridstack.min.js',
			'gridstack.css',
			'gridstack.min.css',
			'https://github.com/troolee/gridstack.js/raw/v0.2.6/LICENSE'
		],
		dest:	'3rd/gridstack/'
	},
	lodash:	{
		options:	{
			rename:	{
				'3rd/lodash/LICENSE':	'3rd/lodash/LICENSE.txt',
			}
		},
		baseurl:	'https://raw.githubusercontent.com/lodash/lodash/4.17.4/dist/',
		url:	[
			'lodash.js',
			'lodash.min.js',
			'https://github.com/lodash/lodash/blob/4.17.4/LICENSE'
		],
		dest:	'3rd/lodash/'
	},
	'jquery-ui':	{
		options:	{
			unzip:	true,
			rename:	{
				'3rd/jquery-ui-1.12.1':	'3rd/jquery-ui',
				'3rd/LICENSE.txt':	'3rd/jquery-ui/LICENSE.txt',
			}
		},
		url:	[
			'http://jqueryui.com/resources/download/jquery-ui-1.12.1.zip',
			'https://github.com/jquery/jqueryui.com/raw/v1.12.1/LICENSE.txt'
			],
		dest:	'3rd/'
	},
*/	ckeditor:	{
		options:	{
			unzip:	true
		},
		url:	'http://download.cksource.com/CKEditor/CKEditor/CKEditor%204.6.2/ckeditor_4.6.2_full.zip',
		dest:	'3rd/'
	},
	'font-awesome': {
		options:	{
			unzip:	true,
			rename:	{
				'3rd/font-awesome-4.7.0':	'3rd/font-awesome',
				'3rd/OFL.txt':	'3rd/jquery-ui/font-awesome/OFL.txt',
			}
		},
		url: [
			'http://fontawesome.io/assets/font-awesome-4.7.0.zip',
			'http://scripts.sil.org/cms/scripts/render_download.php?format=file&media_id=OFL_plaintext&filename=OFL.txt'
		],
		dest: '3rd/'
	}
};
