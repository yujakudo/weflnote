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
    this.editEvents = [];
    var data = this.atm.scriptData('text/x-weflnote-book');
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
        editable:   "div.wn-html",
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
	yjd.atms(this.template.pageTag, this.atm).each(this, func);
};

/**
 * Do loop each section
 * @param {function} func callback function.
 * argument has {yjd.atm} page object. if return false, exit loop.
 */
WN.Book.prototype.eachSection = function(func) {
	yjd.atms(this.template.sectionTag, this.atm).each(this, func);
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
    var book = this;
    var i = 0;
    var editWidgets = null;
    if(b_edit) {
        CKEDITOR.disableAutoInline = true;
        this.atm.addClass('edit-mode');
        editWidgets = yjd.atm('<div class="edit-widgets"></div>');
        editWidgets.style('position', 'relative');
        this.atm.append(editWidgets);
        this.sectionMenu = new WN.SectionMenu(this, editWidgets);
        yjd.atms(this.template.editable, this.atm).each(this, function(atm){
            atm.attr('contenteditable', true);
            var instance = CKEDITOR.inline( atm.elm, {startupFocus: false});
            instance.on('focus', ckedOn);
            instance.on('blur', ckedOff);
        });
        this.eachSection(function(atm){
            this.editEvents.push(atm.bind('mouseenter', this, mouseenter));
            this.editEvents.push(atm.bind('mouseleave', this, mouseleave));
        });
    } else {
        yjd.atms(this.template.editable, this.atm).each(this, function(atm){
            atm.removeAttr('contenteditable');
        });
        for(i in CKEDITOR.instances) {
            CKEDITOR.instances[i].destroy();
        }
        while(this.editEvents.length) {
            yjd.atm.unbind(this.editEvents.pop());
        }
        yjd.atm('div.edit-widgets', this.atm).remove();
        this.atm.removeClass('edit-mode');
        this.sectionMenu.destroy();
        this.sectionMenu = null;
        this.setTitles();
    }
    return;
    //
    function mouseenter(event, atm) {
        book.sectionMenu.enterSection(event, atm);
    }
    function mouseleave(event, atm) {
        book.sectionMenu.leaveSection(event, atm);
    }
    function ckedOn(e) {
        book.sectionMenu.hide();
        book.sectionMenu.leaveSection();
    }
    function ckedOff(e) {
//        book.sectionMenu.show();
    }
};

WN.Book.prototype.newSection = function(atmSect, tpl_name, b_after) {

};

WN.Book.prototype.moveSection = function(atmSect, b_down) {
    
};

WN.Book.prototype.deleteSection = function(atmSect) {
    
};