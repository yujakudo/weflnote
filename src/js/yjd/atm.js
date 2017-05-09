/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview jQuery like class and some tools for DOM access.
 * depend on base.js
 * @since  2017.04.17  initial coding.
 */

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
            if(q==='!fragment') {
                this.elm = document.createDocumentFragment();
            } else if(q.match(/^\s*<([\s\S]+)>\s*$/)) {
                this.elm = yjd.createElementFromStr(q);
            } else {
                this.elm = context.querySelector(yjd.atm.cssEscape(q));
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
            } else if(q instanceof Array) {
                this.elm = yjd.createElementFromStr(q);
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
        this.elms = context.querySelectorAll(yjd.atm.cssEscape(q));
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
    var names = name.split(' ');
    for(var i in names) {
        name = names[i];
        if(name) this.elm.classList.add(name);
    }
    return this;
};
yjd.atm.prototype.removeClass = function(name) {
    var names = name.split(' ');
    for(var i in names) {
        name = names[i];
        if(name) this.elm.classList.remove(name);
    }
    return this;
};
yjd.atm.prototype.toggleClass = function(name) {
    var names = name.split(' ');
    for(var i in names) {
        name = names[i];
        if(name) this.elm.classList.toggle(name);
    }
    return this;
};
yjd.atm.prototype.hasClass = function(name) {
    var names = name.split(' ');
    for(var i in names) {
        name = names[i];
        if(name && !this.elm.classList.contains(name)) {
            return false;
        }
    }
    return true;
};
yjd.atm.prototype.class = function(value) {
    if(value===undefined) {
        return this.elm.getAttribute('class');
    }
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
    var s_style='', o_style={};
    if(typeof name=='object') {
        var styles = yjd.atm.getStyleText(name);
        this.elm.setAttribute('style', styles);
    } else if(value!==undefined) {
        name = yjd.atm.hyphen2camel(name);
        this.elm.style[name] = value;
    } else {
        name = yjd.atm.hyphen2camel(name);
        return this.elm.style[name];
    }
    return this;
};

yjd.atm.prototype.removeStyle = function(name) {
    name = yjd.atm.hyphen2camel(name);
    this.elm.style[name] = '';
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

/**
 * get style finaly computed to display.
 * @param {string} name propaty name
 */
yjd.atm.prototype.getStyle = function(name) {
    var style = window.getComputedStyle(this.elm, null);
    name = yjd.atm.hyphen2camel(name);
    return style[name];
};

/**
 * width
 * @param {number} sw 1:with border, 2:expand scroll, other: client
 * @return {number} width;
 */
yjd.atm.prototype.width = function(sw) {
    if(sw===1) return this.elm.offsetWidth;
    else if(sw===2) return this.elm.scrollWidth;
    return this.elm.clientWidth;
};

/**
 * width
 * @param {number} sw 1:with border, 2:expand scroll, other: client
 * @return {number} width;
 */
yjd.atm.prototype.height = function(sw) {
    if(sw===1) return this.elm.offsetHeight;
    else if(sw===2) return this.elm.scrollHeight;
    return this.elm.clientHeight;
};

yjd.atm.prototype.getRect = function(context) {
    return new yjd.atm.rect(this, context);
};

yjd.atm.prototype.setPosBase = function(base) {
    this.posBase = yjd.atm.check(base);
};
/**
 * set and get position value
 * @param {string} name 'top', 'bottom', 'left' ,or 'right' 
 * @param {number} v value when set new value
 * @return {number} value of position.
 */
yjd.atm.prototype.pos = function(name, v) {
    if(v===null || v==='') {
        this.elm.style[name] = null;
    } else if(v!==undefined) {
        if(this.posBase) {
            var curBase;
            if(this.getStyle('position')==='absolute') curBase = this.parent();
            var offset = new yjd.atm.rect(this.posBase, curBase);
            v += offset[name]();
        }
        this.elm.style[name] = v+'px';
    }
    return this.elm.style[name];
};
//  top
yjd.atm.prototype.top = function(v) {
    if(v!==undefined) this.pos('bottom', null);
    return this.pos('top', v);
};
//  bottom
yjd.atm.prototype.bottom = function(v) {
    if(v!==undefined) this.pos('top', null);
    return this.pos('bottom', v);
};
//  left
yjd.atm.prototype.left = function(v) {
    if(v!==undefined) this.pos('right', null);
    return this.pos('left', v);
};
//  right
yjd.atm.prototype.right = function(v) {
    if(v!==undefined) this.pos('left', null);
    return this.pos('right', v);
};


//  get relation
yjd.atm.prototype.parent = function(){
    return new yjd.atm(this.elm.parentElement);
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
    if(!this.elm.parentElement) return this;
    this.elm.parentElement.removeChild(this.elm);
    return this;
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
    var elm = this.elm.querySelector(q);
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
yjd.atm.prototype.bind = function(s_event, o_this, func, capture) {
    if( typeof o_this==='function' ) {
        //  arguments are event, func, capture
        this.elm.addEventListener(s_event, o_this, func);
        return [this.elm, s_event, o_this, func ];
    }
    if(!o_this) o_this = this;
    if(!capture) capture=false;
    var atm = this;
    this.elm.addEventListener(s_event, onevent, capture);
    return [this.elm, s_event, onevent, capture ];

    function onevent(event){
        var args = [ event, atm ];
        func.apply(o_this, args);
    }
};

/**
 * unbind event listner.
 * @param {object} handler handler returned by bind
 */
yjd.atm.unbind = function(handler) {
    handler[0].elm.removeEventListener(handler[1], handler[2], handler[3]);
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
 * it can also be called like atms.each(func);
 * in this case, atms object is set to be 'this'.
 * @param {any} o_this object to be set to 'this' in callback.
 * @param {function} func callback to called in loop.
 * an argument is yjd.atom object.
 * if its return false, exit loop.
 */
yjd.atms.prototype.each = function(o_this, func) {
    if(func===undefined) {
        func = o_this;
        o_this = this;
    }
    for(var i=0; i<this.elms.length; i++) {
        var atm = yjd.atm(this.elms[i]);
        if(false===func.call(o_this,atm)) break;
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

//  scroll to an Element
yjd.atm.scrollTo = function (elm, container) {
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
yjd.atm.getStyleText = function (obj) {
    var s_style = '';
    for(var prop in obj) {
        if(typeof obj[prop] ==='string' || typeof obj[prop] ==='number')
            s_style += prop+':'+obj[prop]+';';
    }
    return s_style;
};

yjd.atm.hyphen2camel = function(str) {
    return str.replace(/\-([a-z])/g, function(matched, p1){
        return p1.toUpperCase();
    });
};

/** get object of style.
 * @param {string} style string of style info
 * @return {object} style object
 */
yjd.atm.getStyleObj = function(str) {
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
 * escape css special charactors
 * @to-do is it needed?
 */
yjd.atm.cssEscape = function(str) {
    return str;
//    return str.replace(/([\.\:\(\)\{\}\[\]\\])/g, function(c){
//        return '\\'+c;
//    });
};

/**
 * rectangle
 */
yjd.atm.rect = function(x,y,w,h) {
    if(!(this instanceof yjd.atm.rect)) {
        return new yjd.atm.rect(x,y,w,h);
    }
    if(typeof x==='object') {
        var atm = yjd.atm.check(x);
        var rect = atm.elm.getBoundingClientRect();
        this.x = rect.left;
        this.y = rect.top;
        this.w = rect.width;
        this.h = rect.height;
        if(typeof y==='object') {
            var context = new yjd.atm.rect(y);
            this.context = context;
        }
    } else {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
};
yjd.atm.rect.prototype.top = function(v) {
    if(typeof v==='number') {
        this.y = v;
    }
    v = this.y;
    if(this.context) v -= this.context.top();
    return v;
};
yjd.atm.rect.prototype.bottom = function(v) {
    if(typeof v==='number') {
        this.y = v-this.h+1;
    }
    v = this.y+this.h-1;
    if(this.context) v = this.context.bottom() - v;
    return v;
};
yjd.atm.rect.prototype.left = function(v) {
    if(typeof v==='number') {
        this.x = v;
    }
    v = this.x;
    if(this.context) v -= this.context.left();
    return v;
};
yjd.atm.rect.prototype.right = function(v) {
    if(typeof v==='number') {
        this.x = v+1-this.w;
    }
    v =  this.x+this.w-1;
    if(this.context) v = this.context.right() - v;
    return v;
};
yjd.atm.rect.shift = function(x,y) {
    if(x instanceof yjd.atm.rect) {
        y = -x.y;
        x = -x.x;
    }
    this.x += x;
    this.y += y;
    return this;
};

//  add event listener for this lib.
window.addEventListener('load', function(){
    yjd.atm.ready(true);
}, false);
