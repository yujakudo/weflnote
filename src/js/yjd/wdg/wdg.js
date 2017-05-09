/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview base class of widget
 * depend on yjd.atm
 * @since  2017.05.03  initial coding.
 */

/**
 * constructor.
 * @param {object} structure structure of widget.
 * @param {object} options options.
 * @param {object} def_options default of options.
 */
yjd.wdg = function(structure, options, def_options) {
    this.atm = null;
    this.structure = structure;
    this.events = {}; //    event handlers
    this.options = yjd.extend({}, def_options, options);
    this.lender();  //  set this.atm in this metod.
};

/**
 * explicitly release properties
 */
yjd.wdg.prototype.destroy = function() {
    if(this.atm && this.atm) this.atm.remove();
    this.unbindAll();
    delete this.events;
    delete this.structure;
    delete this.options;
};

yjd.wdg.prototype.unbindAll = function() {
    for(var prop in this.events) {
        yjd.atm.unbind(this.events[prop]);
    }
};

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
