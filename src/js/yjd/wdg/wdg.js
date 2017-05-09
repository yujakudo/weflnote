/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview base class of widget
 * @since  2017.05.03  initial coding.
 */

/**
 * generate instance of widget.
 * @param {string} name name of widget
 * @param {object} structure structure of widget.
 * @param {object} options options.
 */
yjd.wdg = function(name, structure, options) {
	if( yjd.wdg.list[name]) {
		return new yjd.wdg.list[name](structure, options);
	}
	return false;
};

yjd.wdg.list = {};

/**
 * show widget
 */
yjd.wdg.prototype.show = function() {
    this.atm.removeClass('yjd-wdg-hidden');
};

/**
 * hide widget
 */
yjd.wdg.prototype.hide = function() {
    this.atm.addClass('yjd-wdg-hidden');
};

/**
 * overwrite options
 * it can be called as wdg.setOptin({object}) or wdg.setOptin(key, val) 
 * @param {string|object} options object of options. or property name if value is set.
 * @param {any} value option value
 */
yjd.wdg.prototype.setOption = function(options, value) {
    if(value) {
        this.options[options] = value;
    } else {
        yjd.extend(this.options, options);
    }
};

/**
 * inherit prototype to constructor
 * @param {string} name name of widget
 * @param {function} constr constructor 
 */
yjd.wdg.extend = function(name, constr) {
	yjd.extend(constr.prototype, yjd.wdg.prototype);
	yjd.wdg.list[name] = constr;
};
