/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview class of section menu.
 * depend on yjd.wdg.menu
 * @since  2017.05.06  initial coding.
 */

/**
 * section menu extend yjd.wdg.Menu
 * @param {yjd.atm}  book atm object of book.
 * @param {yjd.atm}  atmPlace atm object to append menu.
 */
WN.SectionMenu = function(book, atmPlace) {
    this.book = book;
    this.section = null;
    structure = this.structure();
    WN.SectionMenu.parent.constructor.call(this, structure, {
        type:'popup', this:book, class: 'non-editable'
    });
    this.hide();
//    atmPlace.append(this.atm);
    this.bind();
};

//  extend yjd.wdg.Menu
yjd.extendClass(WN.SectionMenu, yjd.wdg.Menu);

/**
 * bind
 */
/*WN.SectionMenu.prototype.bind = function() {
    WN.SectionMenu.parent.bind.call(this);
    this.events.mouseleave2 = this.atm.bind('mouseleave', this, mouseleave);
    //
    function mouseleave(event, atm) {
        if(this.nextSection) {
            this.enterSection(event, this.nextSection);
        }
    }
};
*/
/**
 * add this to the section
 * @param {Event} event
 * @param {yjd.atm} section atm of section
 */
WN.SectionMenu.prototype.enterSection = function(event, section){
/*    if(this.mouseon) {
        this.nextSection = section;
        return;
    }
*/
    this.section = section;
    section.prepend(this.atm);
    this.atm.parent().style('position','relative');
//    this.nextSection = null;
    this.setOption('args', {0:section});
    this.show();
    this.atm.setPosBase(section);
    this.atm.top(-this.atm.height());
    var rect = this.atm.getRect();
    if(rect.y<0) {
        this.atm.bottom(-this.atm.height());
    }
    this.atm.right(0);
};

/**
 * remove this from section
 * @param {Event} event
 * @param {yjd.atm} section atm of section
 */
WN.SectionMenu.prototype.leaveSection = function(event, section){
    this.nextSection = null;
    if(this.section /*&& this.mouseon===false*/) {
        this.atm.parent().style('position',null);
        this.atm.remove();
        this.hide();
        this.section = null;
        this.setOption('args', {0:null});
    }
};

/**
 * make structure of section menu
 */
WN.SectionMenu.prototype.structure = function() {
    var structure = [];
    newsection.call(this, false, 'before', [
        __('Insert new %% section before'),
        __('Insert new section before')
    ]);
    structure.sep0 = {label:'-'};
    newsection.call(this, true, 'after', [
        __('Insert new %% section after'),
        __('Insert new section after')
    ]);
    structure.sep1 = {label:'-'};
    structure.moveup = {
        label: __('move up'), callback: this.book.moveSection,
        args: [ null, false ]
    };
    structure.movedown = {
        label: __('move down'), callback: this.book.moveSection,
        args: [ null, true ]
    };
    structure.sep2 = {label:'-'};
    structure.delete = {
        label: __('delete section'), callback: this.book.deleteSection,
        args: [ null ]
    };
    return structure;
    //  end
    function newsection(b_after, label, msgs) {
        for(var tpl_name in this.book.template.section) {
            var part = {};
            part.label = msgs[0].fill(__(tpl_name));
            if(this.book.template.section.length===1) {
                part.label = msgs[1];
            }
            part.callback = this.book.newSection;
            part.args = [ null, tpl_name, b_after ];
            var prop = label+'-'+tpl_name;
            structure[prop] = part;
        }
    }
};