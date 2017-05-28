/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview class of main app.
 * @since  2017.04.28  initial coding.
 */

var WN = {};

/**
 * constructor
 */
WN.App = function() {
	this.books = {};
	this.NextBookId = 0;
	this.curBook = null;
	this.atms = {
		container: yjd.atm('#app-container'),
		header: yjd.atm('#app-header'),
		footer: yjd.atm('#app-footer')
	};
	this.menus = new WN.AppMenus(this);
};

/**
 * set status message
 */
WN.App.prototype.statusMsg = function(msg){
	this.menus.msg(msg);
};

/**
 * Show or hide footer
 * @param {boolean} b_show Show footer if true, otherwise hide.
 * @param {boolean} b_temporal temporaly show or hide.
 */
WN.App.prototype.showFooter = function(b_show, b_temporal) {
	if(!this.curBook || this.curBook.isEditMode) b_show = true;
	if(b_temporal===undefined || b_temporal===false) {
		if(this.isShowFooter == b_show) return;
		this.isShowFooter = b_show;
	} else {
		if(!b_show) b_show = this.isShowFooter;
	}
	if(b_show) {
		this.atms.container.removeClass('footer-hidden');
		this.atms.footer.removeClass('footer-hidden');
	} else {
		this.atms.container.addClass('footer-hidden');
		this.atms.footer.addClass('footer-hidden');
		if(!b_temporal) this.isShowFooter = false;
	}
};

/**
 * open notebook or template
 * @param {string}  url URL of notebook to open
 */
WN.App.prototype.open = function(url) {
	var app = this;
	var bookInfo = {};
	bookInfo.url = yjd.getAbsoluteUrl(url);
	bookInfo.name = yjd.urlInfo(bookInfo.url).filename;
	app.statusMsg(__('loading "%%"...').fill(bookInfo.name));
	yjd.ajax(bookInfo.url)
	.then(function(xhr){
		return new Promise(function(resolve, reject){
			//  complete HTML
			if(xhr.responseText.match('<!DOCTYPE')) {
				bookInfo.html = xhr.responseText;
				resolve();
			}
			//  part of HTML
			bookInfo.contentAtm = yjd.atm(xhr.responseText);
			var data = bookInfo.contentAtm.scriptData('text/x-weflnote-book');
			if(false===data) {
				reject(new Error(__('Data text/x-weflnote-book in "%%" is corrupted.').fill(bookInfo.name)));
			}
			if(!data || !data.template || !data.template.envelope) {
				reject(new Error(__('Cannot find "text/x-weflnote-book:template.envelope" in "%%". Or, <!DOCTYPE> is missing.').fill(bookInfo.name)));
			}
			//  load envelope
			bookInfo.env = {};
			bookInfo.env.url = yjd.getAbsoluteUrl(data.template.envelope, bookInfo.url);
			bookInfo.env.name = yjd.urlInfo(bookInfo.env.url).filename;
			yjd.ajax(bookInfo.env.url, this)
			.done(function(text, status, xhr){
				if(text.match('<!DOCTYPE')) {
					bookInfo.html = text;
					resolve();
				}
				reject(new Error(__('Cannot find DOCTYPE declaration in "%%".').fill(bookInfo.env.name)));
			}).fail(function(xhr, status, err){
				reject(new Error(__('%1 when loading "%2".').fill(err, bookInfo.env.name)));
			});
		});
	}).then(function(){
		app.statusMsg(__('loaded "%%".').fill(bookInfo.name));
		//  create iframe
		var frame = yjd.atm('<iframe sandbox="allow-forms allow-scripts allow-same-origin"></iframe>');
		app.atms.container.append(frame);
		var book_id = 'book-'+app.NextBookId++;
		frame.id(book_id);
		//  insert html
		var frameDoc = frame.elm.contentWindow.document;
		frameDoc.open();
		frameDoc.write(bookInfo.html);
		frameDoc.close();
		var bookAtm = yjd.atm('body', frameDoc);
		//  if its envelope, insert content.
		if(bookInfo.contentAtm) {
			var entry = yjd.atm('script[type="text/x-weflnote-content"]', bookAtm);
			if(!entry.elm) {
				throw new Error(__('Cannot find script[type="text/x-weflnote-content"] in "%%".').fill(bookInfo.env.name));
			}
			bookAtm = bookInfo.contentAtm;
			entry.replaceWith(bookAtm);
		}
		app.books[book_id] = new WN.Book(app, bookAtm, frameDoc, bookInfo.url, book_id);
		app.switchBook(book_id);
	}).catch(function(err){
		app.statusMsg(err.message);
		console.log(err);
	});
};

/**
 * Get book to handle.
 * @param {WN.Book|string|null} [book] Identifier for book. ex. Instance, string of ID
 * 	If null or omitted, returns current book.
 * @return {WN.Book} Book instance.
 */
WN.App.prototype.getBook = function(book) {
	if(book instanceof WN.Book) return book;
	if(typeof book==='string') return this.books[book];
	if(!book) return this.curBook;
};

/**
 * Close book
 * @param {WN.Book|string|null} [book] Identifier for book.
 * @todo
 */
WN.App.prototype.close = function(book) {
	book = this.getBook(book);
	if(!book) return;
	//	book.close
	function closed(bookId) {
		delete this.books[bookId];
		this.books = this.books.filter(function(book){return book? true: false; });
		yjd.atm('#'+bookId).remove();
		this.switchBook(-1);
	}
};

/**
 * Change current book
 * @param {WN.Book|string|null} [book] Identifier for book.
 */
WN.App.prototype.switchBook = function(book) {
	if(typeof book==='number') {
		book = this.book[0];	//	@todo history
	} else {
		book = this.getBook(book);
	}
	if(!book) return;
	var id;
	if(this.curBook) {
		if(book.equals(this.curBook)) return;
		id = this.curBook.id;
		yjd.atm('#'+id).addClass('hidden');
	}
	id = book.id;
	yjd.atm('#'+id).removeClass('hidden');
	this.menus.statusChange(book);
	this.curBook = book;
};

/**
 * Change status of book
 * @param {WN.Book|string|null} [book] Identifier for book.
 */
WN.App.prototype.statusChange = function(book) {
	book = this.getBook(book);
	if(!book) return;
	if(!book.equals(this.curBook)) return;
	this.menus.statusChange(book);
};

/**
 * Set title of book.
 * @param {WN.Book|string|null} [book] Identifier for book.
 * @param {string} title Title
 */
WN.App.prototype.setTitle = function(book, title) {
	book = this.getBook(book);
	if(!book) return;
	//	@todo change navigator
	if(book.equals(this.curBook))	this.setWindowTitle(title);
};

/**
 * set window title
 */
WN.App.prototype.setWindowTitle = function(title) {
	if(!title) title = 'weflnote';
	yjd.atm('title').text(title+' - weflnote');
};

/**
 * change edit mode
 * @param {bool} b_edit  turn on to edit mode if true, otherwise turn off. 
 */
WN.App.prototype.editMode = function(book, b_edit) {
	book = this.getBook(book);
	if(!book) return;
	if(b_edit===undefined) b_edit = !book.isEditMode;
	b_edit = book.editMode(b_edit);
	if(!book.equals(this.curBook)) return;

	this.menus.statusChange(book);
	var prop;
	if(b_edit) {
		for(prop in this.atms) this.atms[prop].addClass('app-edit-mode');
	} else {
		for(prop in this.atms) this.atms[prop].removeClass('app-edit-mode');
	}
};

/**
 * Add new page to current book.
 */
WN.App.prototype.newPage = function() {
	if(this.curBook) this.curBook.newPage.apply(this.curBook, arguments);
};

/**
 * Add new section to current book.
 */
WN.App.prototype.newSection = function() {
	if(this.curBook) this.curBook.newSection.apply(this.curBook, arguments);
};