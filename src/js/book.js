/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview class of book.
 * @since  2017.04.28  initial coding.
 */

/**
 * constructor
 * @param {WN.App}  WN.App object.
 * @param {string}  url URL of this book.
 * @param {string}  book_id ID of this book.
 */
WN.Book = function(app, url, book_id) {
    this.app = app;
    this.url = yjd.getAbsoluteUrl(url);
    this.atm = yjd.atm('#'+book_id);
	this.curPage = null;
    this.editMode = false;
    this.wdg = {};
    var data = this.atm.scriptData('script[type="text/x-weflnote-book"]');
    if(!data) {
        var msg = __('book data does not exist.');
        if(data===false) msg = __('book data is corrupted.');
        this.app.statusMsg(msg);
        data = {};
    }
    data = yjd.extend({}, this.def_data, data);
    this.template = data.template;
    this.options = data.options;
    if(yjd.atm('style', this.atm).text()==='') this.loadCss();
    this.editMode = this.options.defaultEditMode;
    this.bind();
    this.initIndex();
};

/**
 * default data
 */
WN.Book.prototype.def_data = {
    template:   {
        css:    null,
        editable:   "div.header, div.footer, section",
        indexTag:   'ul.tabs-list',
	    indexTemplate: "<li class=\"tab\"></li>",
		editModeSwitch: null,
        pageTag:    'div.page',
        page: {
            page: "<div class=\"page\"><section class=\"html\"><h2>New page</h2></section></div>"
        },
        sectionTag: 'section',
        section: {
            normal: "<section class=\"html\"><h3>New section</h3></section>",
        }
    },
    options:    {
        defaultEditMode:    false,
    }
};

/**
 * bind event listeners.
 */
WN.Book.prototype.bind = function() {
    if(this.template.editModeSwitch) {
        yjd.atm(this.template.editModeSwitch)
        .bind('click', this, function(event, atm){
            this.editmode(atm.toggle());
            this.app.editmode();
        });
    }
};

/**
 * Do loop each page
 * @param {function} func callback function.
 * argument has {yjd.atm} page object. if return false, exit loop.
 */
WN.Book.prototype.eachPage = function(func) {
	yjd.atms(this.template.pageTag, this.atm).each(func);
};

/**
 * Do loop each section
 * @param {function} func callback function.
 * argument has {yjd.atm} page object. if return false, exit loop.
 */
WN.Book.prototype.eachSection = function(func) {
	yjd.atms(this.template.sectionTag, this.atm).each(func);
};

/**
 * load template CSS
 */
WN.Book.prototype.loadCss = function() {
    if(!this.template.css )  return;
    var src = this.template.css;
    var url = yjd.getAbsoluteUrl(src, this.url);
    var book = this;
	yjd.ajax(url, this)
    .done(function(data, status, xhr){
        yjd.atm('style', this.atm).text(data);
        book.app.statusMsg(__('"%%" are applied.').fill(src));
    }).fail(function(xhr, status, err){
        book.app.statusMsg(err.message);
    });
	this.app.statusMsg(__('loading "%%".').fill(src));
};

/**
 * initiarize page index
 */
WN.Book.prototype.initIndex = function() {
    var index = yjd.atm(this.template.indexTag, this.atm);
    if(!index.elm)   return;
    var template = this.template.indexTemplate;
    this.eachPage(function(page){
        index.append(template);
    });
    this.setTitles();
    this.selectPage(0);
};

/**
 * set title of window and each index item from headlines.
 */
WN.Book.prototype.setTitles = function() {
    var indexes = yjd.atm(this.template.indexTag, this.atm);
    var i = 0;
	this.eachPage(function(page){
        var tab = indexes.child(i++);
        var str = 'Page-'+i;
		var hl = page.find('h1,h2,h3,h4,h5').item(0);
        if(hl && hl.elm) {
		    str = hl.text();
        }
		tab.text(str).attr('title', str);
	});
    var title = yjd.atm('h1,h2,h3,h4,h5', this.atm).text();
    this.app.setTitle(title);
    this.atm.attr('title', title);
};

/**
 * select page
 * @param {number|string} n_page index of page, or text of headline.
 */
WN.Book.prototype.selectPage = function(n_page) {
    var index = yjd.atm(this.template.indexTag, this.atm);
    if(typeof n_page ==='string') {
        index.children().each(function(tab){
            if(tab.text()===n_page || tab.atta('title')===n_page) {
                n_page = i;
                return false;
            }
        });
        if(typeof n_page ==='string') return;
    }
    var i=0;
    this.eachPage(function(page){
        if(n_page==i) {
            page.removeClass('hidden');
            index.child(i).addClass('selected');
            this.curPage = page;
        } else {
            page.addClass('hidden');
            index.child(i).removeClass('selected');
        }
        i++;
    });
};

/**
 * change edit mode
 * @param {bool}    b_edit  turn on to edit mode if true, otherwise turn off. 
 */
WN.Book.prototype.editmode = function(b_edit) {
    this.editMode = b_edit;
    var i = 0;
    if(b_edit) {
        this.atm.addClass('edit-mode');
        yjd.atms(this.template.editable, this.atm).each(function(atm){
            atm.attr('contenteditable', true);
            CKEDITOR.inline( atm.elm, {startupFocus: false});
        });
        this.eachSection(function(atm){
            atm.bind('mouseenter', this.showSectionMenu);
            atm.bind('mouseleave', this.hideSectionMenu);
        });
    } else {
        this.atm.removeClass('edit-mode');
        for(var prop in CKEDITOR.instances) {
            CKEDITOR.instances[prop].destroy();
        }
        yjd.atms(this.template.editable, this.atm).each(function(atm){
            atm.removeAttr('contenteditable');
        });
        this.eachSection(function(atm){
            atm.unbind('mouseenter', this.showSectionMenu);
            atm.unbind('mouseleave', this.hideSectionMenu);
        });
        this.setTitles();
    }
    var menu = null;
    //  end of function
};

WN.Book.prototype.showSectionMenu = function(event, atmSect) {
    var menu = this.sectionMenu(atmSect);
    atmSect.affter(menu);
};

WN.Book.prototype.hideSectionMenu = function(event, atmSect) {
    this.sectionMenu().remove();
};

/**
 * get section popup menu.
 * @param {yjd.atm} atmSect object of current section.
 */
WN.Book.prototype.sectionMenu = function(atmSect) {
    if(this.wdg.sectionMenu) {
        if(atmSect) this.wdg.sectionMenu.setOption(args, {0: atmSect});
        return this.wdg.sectionMenu;
    }
    var structure = [];
    var part;
    newsection(false, 'before', [
        __('Insert new %% section before'),
        __('Insert new section before')
    ]);
    structure.push({label:'-'});
    newsection(true, 'after', [
        __('Insert new %% section after'),
        __('Insert new section after')
    ]);
    structure.push({label:'-'});
    structure.moveup = {
        label: __('move up'), callback: this.moveSection,
        args: [ null, false ]
    };
    structure.movedown = {
        label: __('move down'), callback: this.moveSection,
        args: [ null, true ]
    };
    structure.push({label:'-'});
    structure.movedown = {
        label: __('delete section'), callback: this.deleteSection,
        args: [ null ]
    };
    this.wdg.sectionMenu = new yjd.wdg.Menu(structure);
    if(atmSect) this.wdg.sectionMenu.setOption(args, {0: atmSect});
    return this.wdg.sectionMenu;

    function newsection(b_after, label, msgs) {
        for(var tpl_name in this.template.section) {
            var part = {};
            part.label = msgs[0].fill(__(tpl_name));
            if(this.template.section.length===1) {
                part.label = msgs[1];
            }
            part.callback = this.newSection;
            part.args = [ null, tpl_name, b_after ];
            var prop = label+'-'+tpl_name;
            structure[prop] = part;
        }
    }
};

WN.Book.prototype.newSection = function(atmSect, tpl_name, b_after) {

};

WN.Book.prototype.moveSection = function(atmSect, b_down) {
    
};

WN.Book.prototype.deleteSection = function(atmSect) {
    
};