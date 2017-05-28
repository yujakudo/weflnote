/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview class of book.
 * @since  2017.04.28  initial coding.
 */

/**
 * constructor
 * @param {WN.App}  WN.App object.
 * @param {yjd.atm}  atm atm of the book.
 * @param {Document}  document document of the book.
 * @param {string}  url URL of the book.
 * @param {string}  id ID of the book for App.
 */
WN.Book = function(app, atm, document, url, id) {
	this.ready = false;
	this.app = app;			//	App instance
	this.atm = atm;			//	Body element of the book
	this.doc = document;	//	HTML document of the book
	this.url = url;			//	URL of the book or template template
	this.id  = id;			//	ID for App.
	this.title = 'untitled';	//	title.
	this.lastPageId = 0;	//	Last added page ID
	this.isEditMode = false;
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
	this.pagesContainer = this.app;
	if(this.template.page.container) 	this.pagesContainer = yjd.atm(this.template.page.container, this.app);
	this.indexesContainer = yjd.atm(this.template.index.container, this.atm);
	this.loadResources(ready);
	//
	function ready(result) {
		this.ready = result;
		if(result) {
			this.initIndex();
			this.app.statusMsg(__('"%%" is ready!').fill(this.title));
			if(this.options.defaultEditMode) this.App.editMode(this);
		} else {
			this.app.statusChange(this);
		}
	}
};

/**
 * default data
 */
WN.Book.prototype.def_data = {
	template:   {
		css:    null,
		script:    null,
		index: {
			tag: 'li',
			container: 'ul.tabs-list',
			template: {
				normal: '<li></li>',
			}
		},
		page: {
			tag: 'article.page',
			container: null,
			template:  {
				normal: [ '<div class="page">',
					'<section class="html"><h2>New page</h2></section></div>'
				]
			}
		},
		section: {
			tag: 'section',
			container: null,
		}
	},
	options:    {
		defaultEditMode:    false,
	}
};

/**
 * Do loop each page
 * @param {function} func callback function.
 * @param {string} [selector] Selector to select element.
 * argument has {yjd.atm} page object. if return false, exit loop.
 */
WN.Book.prototype.eachPage = function(func, selector) {
	yjd.atms(this.template.page.tag, this.pagesContainer).each(this, selector, func);
};

/**
 * Do loop each section
 * @param {function} func callback function.
 * @param {string} [selector] Selector to select element.
 * argument has {yjd.atm} page object. if return false, exit loop.
 */
WN.Book.prototype.eachSection = function(func, selector) {
	yjd.atms(this.template.sectionTag, this.pagesContainer).each(this, selector, func);
};

/**
 * Compare to book.
 * @param {WN.Book} book
 * @return {boolean} True if equals, or false.
 */
WN.Book.prototype.equals = function(book) {
	return book? this.id===book.id: false;
};

/**
 * Load template's resources.
 * load this.template.style and this.template.script.
 * @param {function} callback callback function to be called when finish loading.
 */
WN.Book.prototype.loadResources = function(callback) {
	var header = yjd.atm('head', this.doc);
	var userCss = null;
	newField({ type: 'css', data: '', url: 'user-css'});
	var noteData = {template: this.template, options: this.options };
	var scripts = "var Note = " + JSON.stringify(noteData) + "\r\n";
	newField({ type: 'javascript', data: scripts, url: 'book-data'});
	var rsrcs = this.template.resource;
	if(!rsrcs) {
		yjd.timeout(this, callback, 0, true);
		return;
	}

	if(!(rsrcs instanceof Array)) rsrcs = [rsrcs];
	var loader = new yjd.Loader(this.url);
	for(var idx in rsrcs) {
		var res = rsrcs[idx];
		loader.enque(res.url, res.type);
	}
	loader.startLoading(this, finishLoading, true);
	//
	function finishLoading(result, que) {
		for(var i in que) {
			var item = que[i];
			if(item.result) newField(item);
			else this.app.statusMsg(item.message);
		}
		//	@todo show alart dialog.
		callback.call(this, result);
	}
	function newField(item) {
		var type = yjd.typeInfo(item.type).synonym;
		var tag = null;
		if(type==='javascript') {
			tag = '<script></script>';
		} else if(type==='css') {
			tag = '<style></style>';
		} else return false;
		var atm = yjd.atm(tag).text(item.data).data('src', item.url);
		if(item.url==='user-css') {
			userCss = atm;
			header.append(atm);
		} else {
			userCss.before(atm);
		} 
		return true;
	}
};

/**
 * Load and apply.
 * @param {string} tag Tag name to apply loaded resource.
 * @param {string} url Url of resource. Relative URL from template HTML is also avairable.
 */
WN.Book.prototype.load = function(tag, url) {
	var name = yjd.urlInfo(url).filename;
	url = yjd.getAbsoluteUrl(url, this.url);
	yjd.ajax(url, this)
	.done(function(data, status, xhr) {
		var css = yjd.atm('<'+tag+'></'+tag+'>').text(data);
		var header = yjd.atm('header', this.doc);
		header.append(css);
		book.app.statusMsg(__('"%%" are applied.').fill(name));
	}).fail(function(xhr, status, err){
		book.app.statusMsg(__('Fail to load "%%". : ').fill(name) + err.message);
	});
};


/**
 * initiarize page index
 */
WN.Book.prototype.initIndex = function() {
	if(!this.indexesContainer.elm) return;
	this.indexesContainer.html('');
	var i = 0;
	this.eachPage(function(page){
		var strId = page.id();
		var id = parseInt(strId, 16);
		if(!isNaN(id) && this.nextPageId<id) this.lastPageId = id;
		var indexAtm = this.setIndex(page, i++);
		this.indexesContainer.append(indexAtm);
	});
	this.setTitle();
};

/**
 * Set index(tab or menu) label
 * @param {yjd.atm} page Elemet of page.
 * @param {string|number} [label] String of label to set. Or, page number.
 * 	If the label is not string, label is automaticaly set from headline or page number.
 * @param {yjd.atm} [atm] Element of index. if omitted, Creates new.
 * @return {yjd.atm} Element of index.
 */
WN.Book.prototype.setIndex = function(page, label, atm) {
	var id = page.id();
	if(id==='') return;
	if(atm===undefined) atm = yjd.atm(this.template.indexTemplate);
	if(typeof label!=='string') {
		lable = (label!==undefined)? 'Page-'+(label+1): '';
		var hl = page.findOne('h1,h2,h3,h4,h5');
		if(hl && hl.elm) {
			var text = hl.text(); 
			if(text) lable = text; 
		}
	}
	atm.text(lable).attr('title', lable).data('id', id);
	return atm;
};

/**
 * Set title of book.
 * @param {string} [title] Title. If omitted, resolves from content headline.
 */
WN.Book.prototype.setTitle = function(title) {
	var dataTitle = this.atm.data('title');
	if(title===undefined) title = dataTitle;
	if(title===null) title = yjd.atm('h1,h2,h3,h4,h5', this.atm).text();
	if(title!==dataTitle) this.atm.data('title', title);
	this.title = title;
	this.app.setTitle(this, title);
};

/**
 * Get page element.
 * @param {number|string} [id] Number of page with starting zero or string of ID.
 * 	If omitted, returns current selected page.
 * @param {boolean} [b_editable] If true, returns editable part of the page.
 *  If false, returns whole part of the page. (Both are not d1ffer in some template.) 
 * @return {yjd.atm|false} specified page. if does not exist, return false. 
 */
WN.Book.prototype.getPage = function(id, b_editable) {
	var page = null;
	if(id===undefined){
		page = yjd.atm(this.template.page.tag+'.wn-book-selected');
	} else if(typeof id==='number') {
		page = this.atm.find(this.template.page.tag).pages.item(id);
	} else {
		page = yjd.atm('#'+id);
	}
	if(b_editable && page && this.template.sectionsContainer) {
		page = yjd.atm(this.template.sectionsContainer, page);
	}
	if(!page) return false;
	return page;
};

/**
 * Change edit mode
 * @param {bool}    b_edit  turn on to edit mode if true, otherwise turn off. 
 */
WN.Book.prototype.editMode = function(b_edit) {
	if(this.isEditMode==b_edit) return;
	this.isEditMode = b_edit;
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
			this.editEvents.push(atm.bind('mouseenter', this, mouseEnterSection));
			this.editEvents.push(atm.bind('mouseleave', this, mouseLeaveSection));
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
	return b_edit;
	//
	function mouseEnterSection(event, atm) {
		book.sectionMenu.enterSection(event, atm);
	}
	function mouseLeaveSection(event, atm) {
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

/**
 * Get page and index from each element or ID.
 * @param {yjd.atm|string} atm Element of page or index.or, string of ID.
 * @return {Object} 
 * @property {string}	id page ID.
 * @property {yjd.atm}	page element of page.
 * @property {yjd.atm}	index element of index.
 * @property {boolean}	result returns true if both of page and index are specified.
 * 	Otherwise returns false..
 */
WN.Book.prototype.getPageAndIndex = function(atm) {
	var rep = { id: null, page: null, index: null, result: false };
	var msg = '';
	if(typeof atm==='string') {
		rep.id = atm;
	} else {
		rep.id = atm.data('id');
		if(rep.id)	rep.index = atm;
		else {
			rep.id = atm.id();
			rep.page = atm;
		}
	}
	if(!rep.id) return;
	if(!rep.page) rep.page = this.pagesContainer.child('#'+rep.id);
	if(!rep.index) rep.index = this.indexesContainer.child('[data-id="'+rep.id+'"]');
	rep.result = (rep.page && rep.index)? true: false;
	return rep;
};

/**
 * Add new page.
 */
WN.Book.prototype.newPage = function(templateIdx, atmAt, b_after) {
	if(b_after===undefined) b_after = true;
	if(templateIdx===undefined) templateIdx = Object.keys(this.template.page)[0];
	var newPage = yjd.atm(this.template.page[templateIdx]);
	var id = ++this.lastPageId;
	newPage.id(id.toString(16));
	var newIndex = this.setIndex(newPage, index);
	if(atmAt===undefined) {
		if(b_after) {
			this.pagesContainer.append(newPage);
			this.indexesContainer.append(newIndex);
		} else {
			this.pagesContainer.prepend(newPage);
			this.indexesContainer.prepend(newIndex);
		}
	} else {
		var idxAt = this.getPageOrIndex(atmAt);
		if(!idxAt) return;
		if(b_after) {
			atmAt.after(newPage);
			idxAt.after(newIndex);
		} else {
			atmAt.befor(newPage);
			idxAt.befor(newIndex);
		}
	}
};

/**
 * Move page.
 * @param {yjd.atm} atm Element of the page.
 * @param {yjd.atm} [atmAt] Element to spacify place. if omitted, insert first or last of book.
 * @param {boolean} [b_after=true] If true, inserts after the element or last of the book.
 * 	If false, inserts before the element of first of the book.
 */
WN.Book.prototype.movePage = function(atm, atmAt, b_after) {
	if(b_after===undefined) b_after = true;
	var id = atm.data('id');
	if(atm.data)

	if(atmAt===undefined) {
		if(b_after) {
			this.pagesContainer.append(page);
			this.indexesContainer.append(index);
		} else {
			this.pagesContainer.prepend(page);
			this.indexesContainer.prepend(index);
		}
	} else {
		var idxAt = this.getPageOrIndex(atmAt);
		if(!idxAt) return;
		if(b_after) {
			atmAt.after(page);
			idxAt.after(index);
		} else {
			atmAt.befor(page);
			idxAt.befor(index);
		}
	}
};

/**
 * Add new section.
 */
WN.App.prototype.newSection = function() {
	if(this.curBook) this.curBook.newSection.apply(this.curBook, arguments);
};

WN.Book.prototype.moveSection = function(atmSect, b_down) {
};

WN.Book.prototype.deleteSection = function(atmSect) {
};