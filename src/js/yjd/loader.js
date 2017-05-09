/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview Class to find directive, load content 
 * and replace directive with content.
 * @since  2017.04.07  initial coding.
 */

/**
 * constructor
 */
yjd.Loader = function() {
	/** Filters of contnt. @type {object}　*/
	this.filters = {};
	/** Function list to triger after readied. @type {function[]} */
	this.ready_funcs = [];
	/** Que for load items. @type {object[]} */
	this.load_que = [];
	/** Number of active items in load_que. @type {number} */
	this.qued_num = 0;
	/** Que for load errors. @type {object[]} */
	this.error_que = [];
	/** callback function when finish loading @type {function} */
	this.fin_callback = null;

	this.setFilter('loader', this.doFilter);
};

/** default item qued to load_que */
yjd.Loader.def_item = {
	src:'', type:'text', elm:null, load_type:'text', status:null
};

/**
 * Set filter function.
 * function must take 2args as '({any}fiter_data, {string}data-type)'.
 * the function is called after loaded successfuly.
 * @param {string} name name of filter
 * @param {function} func filter function.
 */
yjd.Loader.prototype.setFilter = function(name, func) {
	this.filters[name] = func;
};

yjd.Loader.prototype.doFilter = function(data, type) {
	if(type==='text/html') {
		this.parseHtml(data);
	}
};

/**
 * Enque item to load
 * @param {object|string} item Source URL string, or object of que item.
 * @param {string} type Resource type. text, html, xml, json, css. Default is 'text'.
 * @param {object} elm node element to replace with html. Default is null.
 * @param {string} load_type Type for ajax data. default is text. text, html, xml, json. Default is 'text'.
 */
yjd.Loader.prototype.enque = function(item, type, elm, load_type) {
	if(typeof item === 'string') {
		item = yjd.extend({}, yjd.Loader.def_item, {src:item});
		if(type) item.type = type;
		if(elm) item.elm = elm;
		if(load_type) item.load_type = load_type;
	} else {
		item.status = null;
	}
	var idx = this.load_que.length;
	this.load_que[idx] = item;
	this.qued_num++;
	if(typeof this.fin_callback==='function') loadItem(idx);
	return idx;
};

/**
 * Start loading.
 * This will be called after jQuery.ready.
 * @param {callback} callback function when finish loading.
 * 		it take an argument of boolean to show success or NG.
 * @param {boolean} b_html_parse if you do not want to parse html, set false. default is true.
 */
yjd.Loader.prototype.startLoad = function(callback, b_html_parse) {
	if(b_html_parse===undefined || b_html_parse) {
		this.parseHtml();
	}
	if(!callback) callback = 1;		//	only to know loading.
	this.fin_callback = callback;
	for(var i=0; i<this.load_que.length; i++) {
		this.loadItem(i);
	}
};

/**
 * Start loading an item.
 * @param {number} idx index of load_que.
 */
yjd.Loader.prototype.loadItem = function(idx) {
	if( this.load_que[idx]===undefined) return;
	var item = this.load_que[idx];
	if(item.status) return;
	item.status = 'loading';
	yjd.ajax(item.src, this)
	.done(function(data, status, xhr){
		if(item.context && item.elm) {
			var pre = '', post = '';
			if(item.options.envelope) {
				pre = item.options.envelope;
				if(pre.match(/^<(\w)(\s+[^>]*)?>$/)) {
					post = '</'+RegExp.$1+'>';
				} 
			}
			var context = item.context || document;
			yjd.atm(item.elm, context).replaceWith(pre+data+post);
		}
		item.status = 'sccess';
	}).fail(function(xhr, status, err) {
		item.status = err.message;
		this.error_que.push(item);
	}).always(function(){
		var success = (item.status==='sccess')? true: false;
		if(typeof item.options.callback==='function')	item.options.callback(success);
		delete this.load_que[idx];
		if(--this.qued_num===0) {
			while(this.load_que.length) {
				var remain = this.load_que.pop();
				if(remain) {
					item.status = 'Illigal remaining item.';
					this.error_que.push(item);
				}
			}
			var b_res = (this.error_que.length===0)? true: false;
			if(this.fin_callback && typeof this.fin_callback==='function') {
				this.fin_callback(b_res);
			}
		}
	});
};

/**
 * Parse the HTML and enque to load.
 * @param {object} context element to parse. default is document.
 */
yjd.Loader.prototype.parseHtml = function(context) {
	var loader = this;
	if(context===undefined) context = document;
	yjd.atms('script[type="text/x-yjd-loader"]', context).each(function(atm){
		var text = atm.text();
		var data = null;
		try {
			data = JSON.parse(text);
		} catch(e) {
			msg = '<div class="error">'+e.message+': <pre>'+text+'</pre></div>';
			atm.replaceWith(msg);
			return;
		}
		data = yjd.extend({}, yjd.Loader.def_item, data);
		data.context = context;
		data.elm = atm.elm;
		loader.enque(data);
	});
};

/**
 * Display errors.
 * @param {string|object} selector selector to show errors. null is avairable.
 */
yjd.Loader.prototype.showErrors = function(selector) {
	if(selector) {
		var atm_list = yjd.atm('<ul></ul>');
		for(var i=0; i<this.error_que.length; i++) {
			var item = this.error_que[i];
			var msg = item.status+' : src="'+item.src+'"';
			atm_list.append('<li class="error">'+msg+'</li>');
		}
		yjd.atm(selector).append(atm_list);
	}
};

/**
 * Retry load for errors.
 * This will be called after callback function preccesed.
 * @param {callback} callback function when finish loading.
 * 		it take an argument of boolean to show success or NG.
 * @param {boolean} b_html_parse if you do not want to parse html, set false. default is true.
 */
yjd.Loader.prototype.retry = function(callback) {
	while(this.error_que.length) {
		var item = this.error_que.pop();
		this.enque(item);
	}
	this.startLoad(callback, false);
};
