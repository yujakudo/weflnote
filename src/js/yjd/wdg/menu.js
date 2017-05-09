/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview menu widget
 * @since  2017.05.03  initial coding.
 */

/**
 * constructor of menu.
 * @param {object} structure structure of menu.
 * {
 *  name: {label:{string} , disable:{boolean} , callback:{function}, args:{[]}},
 *  :
 * }
 * array of 
 * @param {object} options options.
 */
yjd.wdg.Menu = function(structure, options) {
    this.atm = null;
    this.structure = structure;
    this.options = yjd.extend({}, yjd.wdg.Menu.def_options, options);
    this.lender();
};

yjd.wdg.extend('menu', yjd.wdg.Menu);

/**
 * default options values
 */
yjd.wdg.Menu.def_options = {
    type:       'popup',    //  type of menu
    class:      null,   //  class to be added tag
    autoClose:  false,   //  close when clicked
    this:       null,    //  object set to be 'this' of callback. default is popup instance
    args:  {}           //  arguments to overwrite
};

/**
 * disable or enable menu item
 * @param {string} idx name of menu item
 * @param {boolean} b_disable disable if true.
 */
yjd.wdg.Menu.prototype.disable = function(idx, b_disable) {
    this.structure[idx].disable = b_disable;
    var item = this.atm.findOne('[data-idx="'+idx+'"]');
    if(b_disable) {
        item.addClass('yjd-wdg-disabled');
    } else {
        item.removeClass('yjd-wdg-disabled');
    }
};

/**
 * set new arguments to each item
 * @param {string} idx name of menu item
 * @param {any[]} args array of arguments.
 */
yjd.wdg.Menu.prototype.setArgs = function(idx, args) {
    this.structure[idx].args = args;
};

/**
 * lender
 */
yjd.wdg.Menu.prototype.lender = function() {
    this.atm = yjd.atm('<ul class="yjd-wdg yjd-wdg-menu"></ul>');
    this.atm.addClass('yjd-wdg-'+this.options.type);
    if(this.options.class) this.atm.addClass(this.options.class);
    appendItems(this.structure, this.atm);
    return;

    function appendItems(structure, atmMenu) {
        for(var prop in structure) {
            var data = structure[prop];
            var item = yjd.atm('<li></li>');
            item.data('idx', prop);
            atmMenu.append(item);
            if(data.label==='-') {
                item.addClass('yjd-wdg-disabled');
                item.html('<hr/>');
                continue;
            }
            item.text(data.label);
            if(data.disabled) item.addClass('yjd-wdg-disabled');
            if(data.callback) item.bind('click', this, onclick);
            if(data.submenu) {
                item.bind('mouseenter', this, onmouseenter);
                item.bind('mouseleave', this, onmouseleave);
                var atmSubmenu = yjd.atm('<ul class="yjd-wdg-submenu yjd-wdg-hidden"></ul>');
                appendItems(data.submenu, atmSubmenu);
                item.append(atmSubmenu);
            }
        }
    }
    function onclick(event, atm){
        if(atm.hasClass(yjd-wdg-disabled)) return;
        var idx = atm.data('idx');
        var o_this = this.options.this || this;
        var args = yjd.extend([], this.structure[idx].args, this.options.args);
        this.structure[idx].callback.apply(o_this, args);
        if(this.options.autoClose) {
            this.atm.remove();
        }
    }
    function onmouseenter(event, atm){
        if(atm.hasClass(yjd-wdg-disabled)) return;
        atm.findOne('ul').removeClass('yjd-wdg-hidden');
    }
    function onmouseleave(event, atm){
        atm.findOne('ul').addClass('yjd-wdg-hidden');
    }
};