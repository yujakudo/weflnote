/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview Super class of editors.
 * depend on yjd.base
 * @since  2017.05.21  initial coding.
 */

/**
 * Class of editor.
 * This is called from each sub class.
 * @constructor
 * @param {WN.book} book book object
 * @param {Object} options Options for each editor.
 * @param {Object} def_ooptions Default values of options.
 */
WN.Editor = function(book, options, def_options) {
    this.book = book;
    this.options = yjd.extend({}, options, def_options);
	this.events = [];
    this.isEditMode = false;
};
/**
 * @typedef {Options}	WN.Editor.options
 * @param {string}	class	Name of class to specify sections.
 * @param {string|string[]} template TEmplate of new section.
 */

//  To inherit this class, extend like this.
//  yjd.extend(WN.ChildEditor, WN.Editor);

/**
 * Destroy.
 * Explicitly release propertie.
 */
WN.Editor.prototype.destroy = function() {
    if(!this.isEditMode) this.editMode(false);
    yjd.obj.prototype.destroy.call(this);
};

/**
 * Unbind all event listners.
 */
WN.Editor.prototype.unbindAll = function() {
	for(var i in this.events)	yjd.atm.unbind(this.events[i]);
};

/**
 * Create new section.
 * @param {boolean} [b_after=true] add new sction after specified section if true.
 * 	Or, add before the section.
 * @param {yjd.atm} [curSec]	Forcused section. when omitted, add new section
 * 	last or first of current pase.
 */
WN.Editor.prototype.newSection = function(b_after, curSec) {
	if(b_after===undefined) b_after = true;
	var atm = yjd.atm(this.options.template);
	atm.addClass(this.options.class);
	if(curSec) {
		if(b_after) curSec.after(atm);
		else curSec.befor(atm);
	} else {
		var page = this.book.getPage(null, true);
		if(page) {
			if(b_after) page.append(atm);
			else page.prepend(atm);
		}
	}
	return atm;
};

/**
 * Get editable sections in the book.
 * @return {yjd.atms} Editorble sections.
 */
WN.Editor.prototype.editables = function() {
	return this.book.atm.find('.'+this.options.class);
};

/**
 * Loop for each editables.
 * @param {yjd.atms.each.callback} callback callback function for each editable.
 * 	if return false in it, exits the loop. 'this' becomes the editor instance ini it.
 */
WN.Editor.prototype.eachEditable = function(callback) {
	this.editables().each(this, callback);
};

/**
 * On or off edit mode.
 * Should be overwritten.
 * @param {bool} b_edit  turn on to edit mode if true, otherwise turn off. 
 */
WN.Editor.prototype.editMode = function(b_edit) {
    this.isEditMode = b_edit;
};

/**
 * Register editor.
 * This is called from main brock of each editor's file.
 * @param {string} idx	index
 * @param {function} constructor Constructor of editor class.
 * @param {string} label label of sections the editor makes.
 * @param {string} desc Description of sections the editor makes.  
 */
WN.Editor.register = function(idx, constructor, label, desc) {
	if( WN.Editor.register.list[idx] ) {
		throw new Error('Editor "'+idx+'" is already registered.');
	}
	WN.Editor.register.list[idx] = {
		class: constructor,
		label: label,
		desc: desc
	};
};

/**
 * List of editors.
 * @type {Object[]}
 * @property {function} constructor Constructor of editor class.
 * @property {string} label label of sections the editor makes.
 * @property {string} desc Description of sections the editor makes.  
 */
WN.Editor.register.list = {};
