/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview Grunt task to wget libs and unzip its.
 * depends on adm-zip, request module
 * @since  2017.04.20  initial coding.
 */

module.exports = function(grunt) {
	var fs = require('fs');
	var path = require('path');
    var request = require('request');
//	var decompress = require('decompress');
    var async = require('async');
    var Zip = require("adm-zip");

    grunt.registerMultiTask('loadLib', 'wget and unzip', function(task, target) {
        var done = this.async();
		var options = this.options({
			unzip:	false,		//	unzip if true
			rename: false,		//	rename after load.
		});
        var baseurl = this.data.baseurl || '';
        var dest = this.data.dest || '.';
        dest = arrangePath(dest, true);
        grunt.file.mkdir(dest);
        if(!grunt.file.isDir(dest)) {
            done(new Error('Can not make directory '+dest));
        }
        grunt.verbose.writeln('made directory '+dest);

        var urls = [];
		grunt.util.recurse(this.data.url, function(one){
			urls.push(baseurl + one);
		});
        async.forEach(urls, function(url, done){
            var name = path.basename(url);
            grunt.verbose.writeln('request '+name);
            request({ url: url, encoding: null }, function (err, res, body) {
                if (err) {
                    done(err);
                } else if (res.statusCode !== 200) {
                    done(new Error(name+':'+res.statusCode));
                } else {
                    grunt.verbose.writeln('recieve '+name);
                    var fn = path.join(dest, name);
                    grunt.file.write(fn, body);
                    if(options.unzip && path.extname(fn)==='.zip') {
                        grunt.verbose.writeln('unzip '+name);
                        var zip = new Zip(fn);
		 			    zip.extractAllTo(dest);
                    }
                    done();
                }
            });
        }, function(err){
            grunt.verbose.writeln('sync '+err);
            if (err) grunt.fail.warn(err);
            if(options.rename) {
                for(var src_name in options.rename) {
                    if(grunt.file.exists(src_name)) {
                        var dest_name = options.rename[src_name];
                        grunt.verbose.writeln('rename '+src_name+' to '+dest_name);
                        fs.renameSync(src_name, dest_name);
                    } else {
                        grunt.log.writeln(src_name+' does not exist. can not rename.');                        
                    }
                }
            }
            done();
        });
    });

	function arrangePath(fn, b_strip_last_sla) {
        fn = path.normalize(fn);
		if(process.platform==='win32') {
			fn = fn.replace(/\\/g, '/');
		}
        if(b_strip_last_sla && fn.substr(-1)==='/') {
            fn = fn.substr(0,fn.length-1);
        }
		return fn;
	}
};