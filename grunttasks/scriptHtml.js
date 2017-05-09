/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview Grunt task to generate script tags.
 * @since  2017.04.20  initial coding.
 */

module.exports = function(grunt) {
	var fs = require('fs');

	grunt.registerMultiTask('scriptHtml', 'Write script tags', function(task, target) {
		var options = this.options({
			script:	false,		//	{string|srring[]} scrips to be written before loading
			tag: false,			//	{string|srring[]} tags to be written. ex. meta.
			replace: null,		//	object for replace part of file name. {'regexp':'string to replace'}
			linefeed: "\r\n",	//	linefeed
			indent:	"\t",		//	indent
			query:	false			//	query type. null. 'd'or't', 'i'or'n'
		});
		var file_body = '';
		if(options.tag) {
			grunt.util.recurse(options.tag, function(str){
				file_body = addstr(file_body, str);
			});
		}
		if(options.script) {
			grunt.util.recurse(options.script, function(str){
				file_body = addstr(file_body, '<script>'+str+'</script>');
			});
		}
		grunt.util.recurse(this.data.src, function(fn){
			grunt.verbose.writeln(fn);
			var q = getquery(fn);
			if(typeof options.replace ==='object') {
				for(var prop in options.replace) {
					var regx = new RegExp(prop);
					var old = fn;
					fn = fn.replace(regx, options.replace[prop]);
					if(fn!==old)	break;
				}
			}
			if(fn.substr(-4)==='.css') {
				file_body = addstr(file_body, '<link rel="stylesheet" href="'+fn+q+'" />');
			} else {
				file_body = addstr(file_body, '<script src="'+fn+q+'"></script>');
			}
		});
		grunt.file.write(this.data.dest, file_body);
		grunt.log.writeln('written '+this.data.dest);
		return true;
		//	end

		//	connect string
		function addstr(file_body, str) {
			return file_body + options.indent + str + options.linefeed;
		}

		//	get date query from time stamp
		function getquery(fn) {
			if(!options.query) return '';
			var date = new Date();
			if(grunt.file.exists(fn)) date = fs.statSync(fn).ctime;
			var query = '';
			if(options.query==='i' || options.query==='n') {
				query = date.getTime();
			} else {
				query = date.getFullYear() +
					('0'+(date.getMonth()+1)).substr(-2) +
					('0'+(date.getDate())).substr(-2) +
					'-' + ('0'+(date.getHours())).substr(-2) +
					('0'+(date.getMinutes())).substr(-2) +
					('0'+(date.getSeconds())).substr(-2) +
					'-' + ('00'+(date.getMilliseconds())).substr(-3);
			}
			return '?d='+query;
		}
	});	
};
