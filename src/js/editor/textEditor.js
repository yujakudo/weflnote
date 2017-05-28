/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview Simple text editors.
 * @since  2017.05.22  initial coding.
 */

/**
 * Class of simple text editor.
 * @extends WN.Editor
 * @constructor
 * @param {WN.book} book book object
 * @param {Object} options Options for each editor.
 * @param {Object} def_ooptions Default values of options.
 */
WN.Editor.Text = function(book, options, def_options) {
	WN.Editor.Text.parent.constructor.call(book, options, {
		class:	'wn-editor-text',
		template: [
			'<section><h3>Section title</h3><div>content</div></section>'
		]
	});
};

//	Register this editor.
WN.Editor.register(
	'wn-editor-text', WN.Editor.Text, __('Text section'),
	__('Simple text section with headline'));

//  inherit Editor.
yjd.extend(WN.Editor.Text, WN.Editor);

/**
 * CSS for text input.
 */
WN.Editor.Text.inputCss = {
	margin: '0',
	padding: '0',
	backgroundColor: 'transparent',
	width: '100%',
	border: 'none',
	color: 'inherit',
	font: 'inherit',
	textAlign: 'inherit',
	textDecoration: 'inherit',
	textShadow: 'inherit',
	lineHeight: 'inherit'
};

/**
 * On or off edit mode.
 * Should be overwritten.
 * @param {bool} b_edit  turn on to edit mode if true, otherwise turn off. 
 */
WN.Editor.Text.prototype.editMode = function(b_edit) {
    this.isEditMode = b_edit;
	if(b_edit) {
		this.eachEditable(function(sec){
			this.events.push(sec.bind('click', this, onclick));
		});
	} else {
		this.unbindAll();
	}
	function onclick(event, sec) {
        event.stopPropagation();
        var itemAtm  = yjd.atm(event.target);
		var tagName = itemAtm.tag();
		if(tagName==='textarea') return;
        if(tagName==='section') itemAtm = itemAtm.find('div');
		var text = itemAtm.html();
		var height = itemAtm.height();
		text = text.replace(/\s+/g, ' ');
		text = text.replace(/<\s*br\s*[\/]?>/g, "\n");
		text = yjd.htmlUnescape(text);
		itemAtm.html('<textarea></textarea>');
		var input  = itemAtm.child('textarea');
		input.style(yjd.Editor.Text.inputCss);
		input.style('height', height+'px');
		input.data('org', text).val(text).focus();
		input.bind('blur', this, function(event, atm){
			var text = atm.val();
			text = text.replace(/\r\n|\r/g, "\n");
			text = htmlEscape(text);
			text = text.replace(/\n/g, "<br\/>\n");
			atm.parent().html(text);
		});
	}
};