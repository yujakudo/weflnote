/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview Grunt task to generate watch task.
 * @since  2017.04.20  initial coding.
 */

module.exports = function(grunt) {
	var fs = require('fs');
	var path = require('path');
	//	read config and options
	var cnf_data = grunt.config.get('makeWatch') || {};
	cnf_data.options = cnf_data.options || {};
	cnf_data.options.gruntfile = cnf_data.options.gruntfile || 'Gruntfile.js';
	cnf_data.options.watchfile = cnf_data.options.watchfile || 'grunt.watch.json';
	cnf_data.depends = cnf_data.depends || [];
	//	grunt task
	var org_watch = grunt.config.get('watch') || {};
	var b_written = false;
	grunt.task.registerTask('makeWatch', 'Write watch configrations', function(){
		if(!b_written) {
			var watch = makeWatchRules(org_watch, cnf_data);
			cnf_data.allTargets = getAllTargets(watch);
			writeWatch(watch, cnf_data);
		}
		return true;
	});
	//	if watchfile is new, read it and set.
	if(!checkCreate(cnf_data))	return;
	//	new watch rules.
	var watch = grunt.config.get('watch') || {};
	makeWatchRules(watch, cnf_data);
	cnf_data.allTargets = getAllTargets(watch);
	grunt.config.set('watch', watch);
	grunt.config.set('makeWatch', cnf_data);
	writeWatch(watch, cnf_data);
	b_written = true;
	//	end

	//	return watch file should be created. if not, apply data in watch file.
	function checkCreate(cnf_data) {
		var gruntfile = cnf_data.options.gruntfile;
		var watchfile = cnf_data.options.watchfile;
		if(!fs.existsSync(watchfile) || !fs.existsSync(gruntfile)) {
			grunt.verbose.writeln(watchfile+' or '+gruntfile+' does not exists.');
			return true;
		}
		var watch = grunt.file.readJSON(watchfile);
		var depends = watch.depends || [];
		delete watch.depends;
		depends.push(gruntfile);
		//	check time
		grunt.verbose.write(watchfile+' depends ');
		var d_watch = fs.statSync(watchfile).ctime;
		for( var i=0; i<depends.length; i++) {
			grunt.verbose.write(depends[i]+', ');
			var d_dep = fs.existsSync(depends[i])? fs.statSync(depends[i]).ctime: false;
			if( !d_dep || d_dep.getTime()>d_watch.getTime())	break;
		}
		if(i<depends.length) {
			grunt.verbose.writeln(watchfile+' should be remake.');
			return true;
		}
		grunt.verbose.writeln('set from '+watchfile);
		//	set data in watch file
		cnf_data.allTargets = watch.allTargets;
		delete watch.allTargets;
		grunt.config.set('watch', watch);
		grunt.config.set('makeWatch', cnf_data);
		return false;
	}

	//	create watch data
	function makeWatchRules(watch,cnf_data) {
		var cnf_tasks = toArray(cnf_data.tasks) || ['*'];
		var cnf_except = toArray(cnf_data.except) || [];
		cnf_except.push('watch');
		cnf_except.push('makeWatch');
		var config  = grunt.config.get();
		var prepare = {};

		//	add file and task to prepare array
		function addPrepare(files, s_task) {
			files.forEach(function(file){
				if(typeof file!=='string' || file==='') return;
				file = arrangePath(file);
				if(!prepare[file])	prepare[file] = [];
				if(prepare[file].indexOf(s_task)<0)	{
					prepare[file].push(s_task);
				}
			});
		}

		for(var task in config) {
			if( cnf_except.indexOf(task)>=0)	continue;
			var all_target = true;
			if((cnf_tasks.indexOf('*')!==0 && cnf_tasks.indexOf(task)<0) )	all_target = false;
			grunt.verbose.writeln('At '+task+'. '+(all_target?'for all target':'test each target'));

			var count = 0;
			for(var target in config[task]) {
				var s_task = task+':'+target;
				grunt.verbose.writeln('At '+s_task+'.. ');
				if( cnf_except.indexOf(s_task)>=0 || (!all_target && cnf_tasks.indexOf(s_task)<0))	{
					grunt.verbose.writeln('skiped.');
					continue;
				}
				var target_data = config[task][target];
				var dep_files = getdependFiles(task, target_data, cnf_data);
				if(dep_files!==false) {
					grunt.verbose.writeln(s_task+' depends on '+JSON.stringify(dep_files));
					addPrepare(dep_files, s_task);
					count++;
				}
			}
			//	if no target, check task root
			if(!count && all_target) {
				var files = getdependFiles(task, config[task], cnf_data);
				if(files!==false)	addPrepare(files, task);
			}
		}
		for(var file in prepare) {
			var ref_target = getTargetHasSames(watch, prepare[file], 'tasks');
			if(ref_target!==false) {
				watch[ref_target].files.push(file);
				continue;
			}
			var name = path.basename(file);
			var rule = newRule(watch, name);
			rule.files = [file];
			rule.tasks = prepare[file].concat();
		}
		return watch;
	}

	//	make nested array or just string flat 
	function toArray(data) {
		if(data===undefined || data===null )	return null;
		var arr = [];
		grunt.util.recurse(data, function(one){
			arr.push(one);
		});
		return arr;
	}

	//	get files on that a task depend
	function getdependFiles(task, target_data, cnf_data) {
		var files = [];
		if(target_data.src) {
			files = toArray(target_data.src);
		} else if(target_data.files) {
			for(var prop in target_data.files) {
				var value = target_data.files[prop];
				if(typeof value==='string') {
					files.push(target_data.files[prop]);
				} else if(typeof value==='object') {
					var add_files = getdependFiles(null, value, cnf_data);
					if(add_files) files = files.concat(add_files);
				}
			}
		}
		if(target_data.cwd) {
			var wd = arrangePath(target_data.cwd, true);
			files = files.map(function(fn){
				return path.join(wd, fn);
			});
		}
		var resolve = {
			ect:	/<%\s*include\s*(\'([^\']+)\'|\"([^\"]+)\")\s*%>/g,
			sass:	/@import \s*(\'([^\']+)\'|\"([^\"]+)\")\s*;/g,
		};
		if(resolve[task]) {
			var includes = [];
			files.forEach(function(fn){
				resolveIncluds(includes, resolve[task], fn, cnf_data);
			});
			files = files.concat(includes);
		}
		if(cnf_data.options.dependency && cnf_data.options.dependency[task]) {
			var deps = toArray(cnf_data.options.dependency[task]);
			deps.forEach(function(dep){
				dep = dep.split(':');
				var data = target_data;
				dep.forEach(function(prop){
					if(data && data[prop]) {
						data = data[prop];
					} else {
						data = null;
					}
				});
				data = toArray(data);
				if(data)	files = files.concat(data);
			});
		}
		if(files.length)	return files;
		return false;
	}

	//	recursively resolve dependency of include directives
	function resolveIncluds(ar_files, regex_match, s_fn, cnf_data) {
		if(cnf_data.depends.indexOf(s_fn)<0) {
			cnf_data.depends.push(s_fn);
		}
		if(!grunt.file.exists(s_fn)) {
			grunt.log.writeln(s_fn+' does not exist. it is refered to includ.');
			return;
		}
		var file = grunt.file.read(s_fn);
		if(!file) return;
		var dir = path.dirname(s_fn);
		file.replace(regex_match, function(match, p1, p2, p3){
			var s_inc_fn = p2 || p3;
			if(s_inc_fn==='')	return '';
			if(!grunt.file.exists(s_inc_fn)) {
				s_inc_fn = path.join(dir, s_inc_fn);
				s_inc_fn = arrangePath(s_inc_fn);
			}
			if(!grunt.file.exists(s_inc_fn)) {
				//	To create whatch file when newed first named file.
				cnf_data.depends.push(p2 || p3);
			}
			ar_files.push(s_inc_fn);
			resolveIncluds(ar_files, regex_match, s_inc_fn, cnf_data);
			return '';
		});
	}

	//	get watch target that has just passed data not less or much in prop.  
	function getTargetHasSames(watch, arr, prop) {
		for(var ref_target in watch) {
			var ref_arr = watch[ref_target][prop];
			if(ref_arr.length != arr.length) continue;
			for(var i=0; i<arr.length; i++) {
				if(ref_arr.indexOf(arr[i])<0) break;
			}
			if(i==arr.length) {
				return ref_target;
			}
		}
		return false;
	}

	//	make new watch target
	function newRule(watch, target) {
		var target_name = target;
		var i = 0;
		while(watch[target_name]) {
			target_name = target + (++i);
		}
//		watch[target_name] = {options:{nospawn:false}};
		watch[target_name] = {};
		return watch[target_name];
	}

	//	write watch file
	function writeWatch(watch, cnf_data) {
		watch.allTargets = cnf_data.allTargets;	//	grunt all
		watch.depends = cnf_data.depends;		//	for check new watch file
		grunt.file.write(cnf_data.options.watchfile, JSON.stringify(watch, null, "\t"));
		grunt.log.writeln('makeWatch made '+cnf_data.options.watchfile);
	}

	//	get targets from watch object
	function getAllTargets(watch) {
		var ar_targets = [];
		for(var target in watch) {
			var ar_tasks = watch[target].tasks;
			for( var i in ar_tasks) {
				if(ar_targets.indexOf(ar_tasks[i])<0)	ar_targets.push(ar_tasks[i]);
			}
		}
		return ar_targets;
	}

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
