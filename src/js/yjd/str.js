/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview extend string and functions for locale.
 * @since  2017.04.17  initial coding.
 */

/**
 * fill wild cards.
 * if this takes one string argument, replaces '%%' with it.
 * if this takes multiple strings, replaces '%n'(n=1,2,...) with its.
 * if this takes object argument, replaces '%name%' with same named property of it.
 * @param {object|string} obj strings to replace, or an object containing those.
 * @return replaced string
 */
String.prototype.fill = function(obj) {
    var str = this.toString();
    if(typeof obj === 'string' || typeof obj === 'number') {
        if(arguments.length==1) {
			if(str.match('%%')) str = str.replace('%%', obj);
			else str = str.replace('%1', obj);
        } else {
            for(var i=0; i<arguments.length; i++) {
                str = str.replace('%'+(i+1), arguments[i]);
            }
        }
    } else {
        for(var prop in obj) {
            var rex =  new RegExp('%'+prop+'%', 'g');
            str = str.replace(rex, obj[prop]);
        }
    }
    return str;
};

/**
 * name space of string library
 */
yjd.str = {};

/**
 * locale code
 * @type {string}
 */
yjd.str.locale = 'en';

/**
 * options.
 * locales, default
 */
yjd.str.options = {};


/**
 * locales data.
 */
yjd.str.data = {};

/**
 * get string 
 * @param {string} id ID of string.
 * @param {string} locale locale code.
 */
yjd.str.get = function(id, locale) {
	locale = locale || yjd.str.locale;
	var str = getstr(id, locale);
	if(str) return str;
	var i = locale.indexOf('_');
	if(i>0) {
		str = getstr(id, locale.substr(0, i));
		if(str) return str;
	}
	if(yjd.str.options.default) {
		str = getstr(id, yjd.str.options.default);
		if(str) return str;
	}
	return id;

	function getstr(id, locale) {
		if(yjd.str.data[locale] && yjd.str.data[locale][id]) {
			return yjd.str.data[locale][id];
		}
		return false;
	}
};

/** alias */
var __ = yjd.str.get;

/**
 * set options.
 * @param {object} options 
 * { locales: [ 'en', 'ja' ], default: 'en', url: './'}
 */
yjd.str.setOption = function(options) {
	yjd.str.options.locales = options.locales;
	yjd.str.options.default = options.default || 'en';
	yjd.str.options.url = options.url;
};

/**
 * set locale.
 * if locale is not specified,
 * resolve from options and browser settins.
 * @param {string} locale locale code.
 */
yjd.str.setLocale = function(locale) {
	if(locale) {
		yjd.str.locale = locale;
		return;
	}
	var user_locales = window.navigator.languages || [
		window.navigator.language ||
		window.navigator.userLanguage ||
		window.navigator.browserLanguage
	];
	if(!yjd.str.options.locales) yjd.str.locale = user_locales[0];
	for(var i in user_locales) {
		locale = user_locales[i];
		if(yjd.str.options.locales.indexOf(locale)>=0) {
			yjd.str.locale = locale;
			return;
		}
		var bar = locale.indexOf('_');
		if(bar>0) {
			locale = locale.substr(0, bar);
			if(yjd.str.options.locales.indexOf(locale)>=0) {
				yjd.str.locale = locale;
				return;
			}
		}
	}
	if(yjd.str.options.default) {
		yjd.str.locale = yjd.str.options.default;
	}
};

/**
 * set locale data.
 * it can also be called as yjd.str.setData({'en':{},...})
 * @param {string} locale locale code.
 * @param {object} data locale data.
 */
yjd.str.setData  = function(locale, data) {
	if(data===undefined) {
		data = locale;
		locale = null;
	}
	if(!locale) {
		yjd.str.data = data;
	} else {
		yjd.str.data[locale] = data;
	}
};