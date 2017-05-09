/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview class of main app.
 * @since  2017.04.28  initial coding.
 */

/**
 * constructor
 */
WN.App = function() {
    /** array ob Book objects
     * @type    {WN.Book[]}
     */
    this.books = [];
    /** number to add next new book
     * @type    {number}
     */
    this.NextBookId = 0;
    /** current book object
     * @type    {WN.Book}
     */
    this.curBook = null;
};

/**
 * set status message
 */
WN.App.prototype.statusMsg = function(msg){
    yjd.atm('#app-status').html(msg);
};

/**
 * open notebook or template
 * @param {string}  url URL of notebook to open
 */
WN.App.prototype.open = function(url) {
	yjd.ajax(url, this)
    .done(function(data, status, xhr){
        var book_id = 'book-'+this.NextBookId++;
        var atm_book = yjd.atm(data);
        atm_book.attr('id', book_id);
        yjd.atm('#app-content').append(atm_book);
        this.curBookAtm = atm_book;
        this.statusMsg(__('loaded "%%".').fill(url));
        var new_book = new WN.Book(this, url, book_id);
        this.books.push( new_book );
        this.curBook = new_book;
    }).fail(function(xhr, status, err){
        this.statusMsg( err.message );
    });
	this.statusMsg(__('loading "%%".').fill(url));
};

/**
 * change edit mode
 * @param {bool} b_edit  turn on to edit mode if true, otherwise turn off. 
 */
WN.App.prototype.editmode = function() {
    b_edit = this.curBook.editMode;
    if(b_edit) {
        yjd.atm('body').addClass('app-edit-mode');
    } else {
        yjd.atm('body').removeClass('app-edit-mode');
    }
};

/**
 * set title
 */
WN.App.prototype.setTitle = function(str) {
    if(!str) str = 'weflnote';
    yjd.atm('title').text(str);
};
