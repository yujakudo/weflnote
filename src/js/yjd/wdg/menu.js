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
    yjd.wdg.Menu.parent.constructor.call(this, structure, options, {
        type:       'popup',    //  type of menu
        class:      null,   //  class to be added tag
        autoClose:  false,   //  close when clicked
        this:       null,    //  object set to be 'this' of callback. default is popup instance
        args:  {}           //  arguments to overwrite
    });
    this.onmouse = false;
};

yjd.extendClass(yjd.wdg.Menu, yjd.wdg);

/**
 * bind
 * @param {boolean} b_bind bind if true, otherwise unbind
 */
yjd.wdg.Menu.prototype.bind = function() {
    this.events.mouseenter = this.atm.bind('mouseenter', this, mouseenter);
    this.events.mouseleave = this.atm.bind('mouseleave', this, mouseleave);
    this.events.click = this.atm.bind('click', this, onclick, true);
    //  end
    function mouseenter(event, atm) {
        this.mouseon = true;
    }
    function mouseleave(event, atm) {
        this.mouseon = false;
        if(this.options.autoClose) this.destroy();
    }
    function onclick(event, atm) {
        event.stopPropagation();
        if(event.target.tagName.toLowerCase()!=='li') return;
        var idx = yjd.atm(event.target).data('idx');
        var item_data = this.structure[idx];
        if(item_data.disable) return;
        var args = yjd.extend(item_data.args, this.options.args);
        item_data.callback.apply(this.options.this, args);
        if(this.options.autoClose) this.destroy();
    }
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
    this.atm = yjd.atm('<ul class="yjd-wdg"></ul>');
    this.atm.addClass('yjd-wdg-menu-'+this.options.type);
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
                item.attr('title', '');
                continue;
            }
            item.text(data.label);
            item.attr('title', data.label);
            if(data.disabled) item.addClass('yjd-wdg-disabled');
            if(data.submenu) {
                var atmSubmenu = yjd.atm('<ul class="yjd-wdg yjd-wdg-submenu yjd-wdg-hidden"></ul>');
                appendItems(data.submenu, atmSubmenu);
                item.append(atmSubmenu);
            }
        }
    }
};