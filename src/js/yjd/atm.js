/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview jQuery like class and some tools for DOM access.
 * @since  2017.04.17  initial coding.
 */

/**
 * copy properties from objects to subject.
 * this can take multiple arguments.
 * @param {object} obj source object.
 * @return this
 */
yjd.extend = function(subject, obj) {
    for(var i=1; i<arguments.length; i++) {
        obj = arguments[i];
        if(typeof obj !=='object') continue;
        for( var prop in obj) {
            if(obj[prop]===null || obj[prop]===undefined) {
                subject[prop] = obj[prop];
            } else if(typeof obj[prop] === 'object') {
                if(typeof subject[prop] !== 'object') subject[prop] = {};
                yjd.extend( subject[prop], obj[prop]);
            } else {
                subject[prop] = obj[prop];
            }
        }
    }
    return subject;
};

//  scroll to an Element
yjd.scrollTo = function (elm, container) {
    if(container===undefined) container = window;
    var rect = elm.getBoundingClientRect();
    var x = rect.left + container.pageXOffset + (rect.width - container.innerWidth)/2;
    var y = rect.top + container.pageYOffset + (rect.height - container.innerHeight)/2;
    container.scrollTo(x, y);
};

/** get string of style.
 * @param {object} style object of style info
 * @return {string} style sring
 */
yjd.getStyleText = function (obj) {
    var s_style = '';
    for(var prop in obj) {
        if(typeof obj[prop] ==='string' || typeof obj[prop] ==='number')
            s_style += prop+':'+obj[prop]+';';
    }
    return s_style;
};

/** get object of style.
 * @param {string} style string of style info
 * @return {object} style object
 */
yjd.getStyleObj = function(str) {
    var obj = {};
    var rules = str.split(';');
    for(var i in rules) {
        if(rules[i].match(/^\s*([\w-]+)\s*:\s*(.+)$/)) {
            obj[RegExp.$1] = RegExp.$2.trim;
        }
    }
    return obj;
};

/**
 * get absolute URL
 * if baseurl is not spesified, document url is reffered.
 * @param {string} url URL
 * @param {string} baseurl URL. optional.
 * @return {string} absolute URL
 */
yjd.getAbsoluteUrl = function(url, baseurl) {
    if(url.match('://'))    return url;
    if(baseurl===undefined) {
        var anchor = document.createElement('a');
        anchor.href = url;
        return anchor.href;
    }
    while(url.substr(0,2)==='./')   url = url.substr(2);
    baseurl = baseurl.substr(0, baseurl.lastIndexOf('/')+1);
    while(url.substr(0,3)==='../') {
        url = url.substr(3);
        baseurl = baseurl.substr(0, baseurl.length-1);
        baseurl = baseurl.substr(0, baseurl.lastIndexOf('/')+1);
    }
    return baseurl+url;
};

/**
 * escape css special charactors
 */
yjd.cssEscape = function(str) {
    return str;
//    return str.replace(/([\.\:\(\)\{\}\[\]\\])/g, function(c){
//        return '\\'+c;
//    });
};

/**
 * class yjd.atm. tiny class like jQuery.
 * it contains a node.
 * @param {string} query
 * @param {object} context element of context. default is document.
 * @return {object|null} atm object. or null if faile to create.
 */
yjd.atm = function(q, context) {
    if(!(this instanceof yjd.atm)) {
        if(typeof q ==='function') {
            yjd.atm.ready(q);
            return;
        }
        return new yjd.atm(q, context);
    }
    //  resolve context to element.
    context = yjd.atm.contextElm(context);
    this.elm = null;
    //  resolve q
    switch(typeof q) {
        case 'string':
            if(q==='fragment') {
                this.elm = document.createDocumentFragment();
            } else if(q.match(/^\s*<([\s\S]+)>\s*$/)) {
                var node = document.createElement('div');
                node.innerHTML = q;
                this.elm = node.children[0];
            } else {
                this.elm = context.querySelector(yjd.cssEscape(q));
            }
            break;
        case 'number':
            if(q>=0) {
                this.elm = context.children[q];
            } else if(q<0) {
                var len = context.children.length;
                this.elm = context.lastChild[len-q];
            }
            break;
        case 'object':
            if(q instanceof HTMLElement) {
                this.elm = q;
            } else if(q instanceof yjd.atm) {
                this.elm = q.elm;
            }
            break;
    } 
};

/**
 * ensure be yjd.atm object.
 * this can use as alternative of yjd.atm()
 * @param {any} atm
 * @return {yjd.atm|false} 
 */
yjd.atm.check = function(atm) {
    if(this instanceof yjd.atm) return atm;
    atm = new yjd.atm(atm);
    if(!atm.elm) return false;
    return atm;
};

/**
 * class yjd.atms
 * it containes node list
 * @param {string}  q   selector
 * @param {element|yjd.atm|string}  context
 */
yjd.atms = function(q, context) {
    if(!(this instanceof yjd.atms)) {
        return new yjd.atms(q, context);
    }
    context = yjd.atm.contextElm(context);
    if(typeof q==='string') {
        this.elms = context.querySelectorAll(yjd.cssEscape(q));
    } else if(typeof q==='object') {
        if(q instanceof NodeList) {
            this.elms = q;
        } if(q instanceof yjd.atms) {
            this.elms = q.elms;
        }
    }
};

/**
 *  get context element
 *  @param {element|yjd.atm|string} context
 * @return {element}    context element
 */
yjd.atm.contextElm = function(context) {
    if(context instanceof HTMLElement) {
        return context;
    } else if(typeof context==='string' || typeof context==='number') {
        return yjd.atm(context, document).elm;
    } else if(context instanceof yjd.atm) {
        return context.elm;
    }
    return document;
};

/**
 * Register function to execute when readied
 * @param {function}    func    callback coled after loading.
 */
yjd.atm.ready = function(func) {
    var _this = yjd.atm.ready;
    if(_this.funcs===undefined) {
        _this.funcs  = [];
        _this.ready = false;
    }
    //  ready to do.
    if(func===true) {
        _this.b_ready = true;
        for(var i in _this.funcs ) _this.funcs[i]();
        _this.funcs = null;
        return;
    }
    //  register callback or do immediately
    if(_this.b_ready===true) func();
    else _this.funcs.push(func);
};

//  attributes
yjd.atm.prototype.attr = function(name, value) {
    if(typeof name==='object') {
        for(var prop in name) {
            this.elm.setAttribute(prop, name[prop]);
        }
    } else if(value!==undefined) {
        this.elm.setAttribute(name, value);
    } else {
        return this.elm.getAttribute(name);
    }
    return this;
};

yjd.atm.prototype.removeAttr = function(name) {
    this.elm.removeAttribute(name);
    return this;
};

/**
 * set or get data to element by attribute 'data-'.
 * @param {string} key name of data.
 * @param {string|object} val value of data 
 */
yjd.atm.prototype.data = function(key, val) {
    key = 'data-'+key;
    if(val===undefined) {
        val = this.elm.getAttribute(key);
        if(val.length>1 && val.charAt(0)==='{' && val.substr(-1)==='}') {
            val = JSON.parse(val);
        }
        return val;
    }
    if(typeof val==='object')   val = JSON.stringify(val);
    this.elm.setAttribute(key, val);
};

//  class
yjd.atm.prototype.addClass = function(name) {
    this.elm.classList.add(name);
    return this;
};
yjd.atm.prototype.removeClass = function(name) {
    this.elm.classList.remove(name);
    return this;
};
yjd.atm.prototype.toggleClass = function(name) {
    this.elm.classList.toggle(name);
    return this;
};
yjd.atm.prototype.hasClass = function(name) {
    return this.elm.classList.contains(name);
};
yjd.atm.prototype.class = function(value) {
    var classes = value;
    if(typeof value==='object') {
        classes = '';
        for(var prop in value) {
            classes += ' '+value[prop];
        }
    }
    this.elm.setAttribute('class', classes);
    return this;
};

//  style
yjd.atm.prototype.style = function(name, value) {
    var s_style='', o_style='';
    if(typeof name==='object') {
        var styles = yjd.getStyleText(name);
        this.elm.setAttribute('style', styles);
    } else if(value!==undefined) {
        s_style = this.elm.getAttribute('style');
        o_style = yjd.getStyleObj(s_style);
        o_style[name] = value;
        s_style = yjd.getStyleText(name);
        this.elm.setAttribute('style', s_style);
    } else {
        s_style = this.elm.getAttribute('style');
        o_style = yjd.getStyleObj(s_style);
        return o_style[name];
    }
    return this;
};

yjd.atm.prototype.removeStyle = function(name) {
    var s_style = this.elm.getAttribute('style');
    var o_style = yjd.getStyleObj(s_style);
    delete o_style[name];
    s_style = yjd.getStyleText(name);
    this.elm.setAttribute('style', s_style);
    return this;
};

yjd.atm.prototype.html = function(value) {
    if(value!==undefined) {
        this.elm.innerHTML = value;
    } else {
        return this.elm.innerHTML;
    }
    return this;
};

yjd.atm.prototype.text = function(value) {
    if(value!==undefined) {
        this.elm.innerText = value;
    } else {
        return this.elm.innerText;
    }
    return this;
};

//  get relation
yjd.atm.prototype.parent = function(){
    return new yjd.atm(this.parentElement);
};

yjd.atm.prototype.child = function(n){
    return new yjd.atm(n, this);
};

yjd.atm.prototype.children = function(){
    return new yjd.atms(this.children);
};

yjd.atm.prototype.find = function(q){
    return new yjd.atms(q,this);
};

yjd.atm.prototype.findOne = function(q){
    return new yjd.atm(q,this);
};

//  append
yjd.atm.prototype.append = function(atm) {
    atm = yjd.atm.check(atm);
    this.elm.appendChild(atm.elm);
};

//  prepend
yjd.atm.prototype.prepend = function(atm) {
    atm = yjd.atm.check(atm);
    this.elm.insertBefore(atm.elm, this.elm.firstChild);
};

//  before
yjd.atm.prototype.before = function(atm) {
    atm = yjd.atm.check(atm);
    this.elm.parentElement.insertBefore(atm.elm, this.elm);
};

//  after
yjd.atm.prototype.after = function(atm) {
    atm = yjd.atm.check(atm);
    this.elm.parentElement.insertBefore(atm.elm, this.elm.nextSibling);
};

//  remove
yjd.atm.prototype.remove = function() {
    this.elm.parentElement.removeChild(this.elm);
    this.elm = null;
};

//  replace
yjd.atm.prototype.replaceWith = function(atm) {
    atm = yjd.atm.check(atm);
    this.elm.parentNode.replaceChild(atm.elm, this.elm);
    this.elm = null;
};


//  each
yjd.atm.prototype.each = function(q, func) {
    this.find(q).each(func);
    return this;
};

//  clone and replace
yjd.atm.prototype.switchClone = function(b_clone) {
    if(b_clone) {
        this.org = this.elm;
        this.elm = yjd.atm( this.org.cloneNode(true) );
    } else {
        this.elm.parentNode.replaceChild(this.elm, this.org);
        this.elm = this.org;
        delete this.org;
    }
    return this;
};

/**
 * get script data
 * @param {string} type script type like 'text/x-foo'
 * @param {boolean} b_json parse as JSON in true. default is true.
 * @return {string|object|null|false} data string or object.
 * null: can not find script. false: can not parse as JSON.
 */
yjd.atm.prototype.scriptData = function(type, b_json) {
    if(b_json===undefined) b_json = true;
    var q = 'script[type="'+type+'"]';
    var elm = this.querySelector(q);
    if(!elm) return null;
    var data = elm.innerText;
    if(b_json) {
        try {
            data = JSON.parse(data);
        } catch(e) {
            return false;
        }
    }
    return data;
};

/**
 * bind event listner.
 * this can allso call as bind(event, func);
 * @param {string} s_event event type.
 * @see https://developer.mozilla.org/en-US/docs/Web/Events
 * @param {object} o_this object to be set to 'this' in callback
 * @param {function} func callback. arguments are ( {Event} event, {yjd.atm} atm object.
 */
yjd.atm.prototype.bind = function(s_event, o_this, func) {
    if( func===undefined ) {
        func = o_this;
        o_this = null;
    }
    if(!o_this) o_this = this;
    var atm = this;
    this.elm.addEventListener(s_event, onevent, false);

    function onevent(event){
        var args = [ event, atm ];
        func.apply(o_this, args);
    }
};

/**
 * unbind event listner.
 * @param {string} s_event event type.
 * @param {function} func callback. arguments are ( {Event} event, {yjd.atm} atm object.
 */
yjd.atm.prototype.unbind = function(s_event, func) {
    this.elm.addEventListener(s_event, func, false);
};

/**
 * simple toggle interface.
 * @param {string} s_class class name. default is 'on'.
 * @return {bool} has the class or not.
 */
yjd.atm.prototype.toggle = function(s_class) {
    s_class = s_class || 'on';
    this.elm.classList.toggle(s_class);
    return this.elm.classList.contains(s_class);
};

/**
 * loop and do function in atms.
 * @param {function} func callback to called in loop.
 * an argument is yjd.atom object. this keeps outer value.
 * if its return false, exit loop.
 */
yjd.atms.prototype.each = function(func) {
    for(var i=0; i<this.elms.length; i++) {
        var atm = yjd.atm(this.elms[i]);
        if(false===func.call(this,atm)) break;
    }
    return this;
};

/**
 * get (n)th item.
 * @param {number} n index of item.
 */
yjd.atms.prototype.item = function(n) {
    var elm = this.elms.item(n);
    if(elm) return new yjd.atm(elm);
    return false;
};

/**
 * encode object to string of form
 * @param {object} obj
 * @return {string}
 */
yjd.atm.encodeToFormStr = function(obj) {
    var str = '';
    for(var prop in obj ) {
        str += ((str!=='')? '&': '') +
                encodeURIComponent(prop) +
                '=' + encodeURIComponent( obj[prop] );
    }
    return str.replace( /%20/g, '+' );
};

/**
 * Ajax
 * @param {object|string}　options options or URL string.
 * @param {object} o_this object to set 'this' of callbacks. default is options.
 */
yjd.ajax = function(options, o_this) {
    if(typeof options==='string') options = { url: options };
    options = yjd.extend({}, yjd.ajax.default, options);
    if(!o_this) o_this=options;

    var xhr = new XMLHttpRequest();
    var promise = new Promise(ajaxPromise);
    function ajaxPromise(resolve, reject){
        xhr.timeout = options.timeout;
        xhr.onreadystatechange = statechange;
        function statechange() {
            if(xhr.readyState===4) {
                if(200<=xhr.status && xhr.status<300) {
                    resolve(xhr);
                }
                if(window.location.protocol==='file:' && xhr.status===0) {
                    xhr.status = 200;
                    resolve(xhr);
                }
                reject(new Error(xhr.statusText));
            }
        }
        xhr.open(options.method, options.url, options.async, options.username, options.password);
        xhr.setRequestHeader('content-type', options.contentType);
        for(var key in options.headers) {
            xhr.setRequestHeader(key, options.headers[key]);
        }
        if(typeof options.data ==='object' && options.processData) {
            options.data = yjd.atm.encodeToFormStr(options.data);
        }
        if(options.beforeSend) {
            if(false===options.beforeSend.call(options, xhr)) {
                reject(new Error("stoped by beforeSend"));
            }
        }
        var rep = xhr.send(options.data);
    }

    var result = {
        result:     null,
        done:   [], fail:   [], always: []  //  functions
    };
    if(options.success) result.done.push(options.success);
    if(options.error) result.fail.push(options.error);
    if(options.complete) result.always.push(options.complete);

    promise.then( promise_then, promise_error);
    function promise_then(){
        result.result = true;
        result.arguments = [ xhr.responseText, xhr.status, xhr ];
        for(var i in result.done) result.done[i].apply(o_this, result.arguments);
        for(i in result.always) result.always[i].call(o_this, xhr, xhr.status);
    }
    function promise_error(err){
        result.result = false;
        result.arguments = [ xhr, xhr.status, err ];
        for(var i in result.fail) result.fail[i].apply(o_this, result.arguments);
        for(i in result.always) result.always[i].call(o_this, xhr, xhr.status);
    }
    promise.done = promise_done;
    promise.fail = promise_fail;
    promise.always = promise_always;
    return promise;
    
    function promise_done(callback) {
        if(result.result===true) callback.apply(o_this, result.arguments);
        else result.done.push(callback);
        return promise;
    }
    function promise_fail(callback) {
        if(result.result===true) callback.apply(o_this, result.arguments);
        else result.fail.push(callback);
        return promise;
    }
    function promise_always(callback) {
        if(result.result!==null) callback.call(o_this, xhr, xhr.status);
        else result.always.push(callback);
        return promise;
    }
};

//  default option values of ajax
yjd.ajax.default = {
        method: 'GET',  //  GET, POST, PUT, DELETE
        url:    '',     //  URL
        async:  true,  //  asyncronus
        username:   '', //  user
        password:   '', //  password
        contentType:    'application/x-www-form-urlencoded; charset=UTF-8',    //  content-type
        headers:    {},     //  headers
        data:   null,     //  {string|object}
        processData:    true,   //  proc to convert form string
        timeout:    0,  //  timeout msec
        beforeSend :    null,
        success:    null,
        error:  null,
        complete:   null,   //  function(xhr, status)
};

/**
 * overwrite default options.
 * @param {object|string} options options. if string assumed key, value.
 * @param {any} value value if options is string.
 */
yjd.ajax.setDefault = function(options, value) {
    if(typeof options==='string') {
        var key = options;
        options = {};
        options[key] = value;
    }
    yjd.extend(yjd.ajax.default, options);
};

//  add event listener for this lib.
window.addEventListener('load', function(){
    yjd.atm.ready(true);
}, false);
