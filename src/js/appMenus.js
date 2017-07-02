/**
 * @copyright  2017 yujakudo
 * @license    MIT License
 * @fileoverview class of application menu.
 * depend on yjd.wdg.menu
 * @since  2017.05.12  initial coding.
 */

/**
 * application menu extend yjd.wdg.Menu
 * @param {yjd.atm}  app atm object of App.
 * @param {yjd.atm}  atmPlace atm object to append menu.
 */
WN.AppMenus = function(app) {
    this.app = app;
    WN.AppMenus.parent.constructor.call(this, WN.AppMenus.infoMenus, {
        this: this.app,
		autoHide: {
			enable: true,
			delay: 20,
			callback: this.app.showFooter
		}
    });
	var editorMenu = [];
	for(var idx in WN.Editor.register.list) {
		var editor = WN.Editor.register.list[idx];
		editorMenu.push({
			index: idx,
			label: editor.label,
			callback: WN.App.prototype.newSection,
			args:	[ idx ]
		});
	}
	this.addSubMenu(editorMenu, 'mainAddSection');
	this.app.atms.header.append(this.wdgs.main.atm);
	this.app.atms.footer.append(this.atm);
    this.bind();
};

//  extend yjd.wdg.Menu
yjd.extendClass(WN.AppMenus, yjd.wdg.Statusbar);

/**
 * bind
 */
WN.AppMenus.prototype.bind = function() {
	WN.AppMenus.parent.bind.call(this);
	this.events['mouseenter'] = this.atm.bind('mouseenter', this, mouseenter);
	this.events['mouseleave'] = this.atm.bind('mouseleave', this, mouseleave);
	function mouseenter(event, atm) {
		this.app.showFooter(true, true);
	}
	function mouseleave(event, atm) {
		this.app.showFooter(false, true);
	}
};

/**
 * Change enable or  disable as book status.
 * this is called from App.
 * @param {WN.Book} book  Current book instance 
 */
WN.AppMenus.prototype.statusChange = function(book) {
	if(!book.ready) {
		this.disable('mainEdit', true);
		this.disable('statusEditMode', true);
		return;
	}
	this.disable('mainEdit', false);
	this.disable('statusEditMode', false);
	if(book.isEditMode) {
		this.disable('mainAddPage', false);
		this.disable('mainAddSection', false);
		this.switch('mainEditMode', true);
		this.switch('statusEditMode', true);
	} else {
		this.disable('mainAddPage', true);
		this.disable('mainAddSection', true);
		this.switch('mainEditMode', false);
		this.switch('statusEditMode', false);
	}
};

/**
 * Menus info.
 * @const
 */
WN.AppMenus.infoMenus = {
	//	Header main menu. 
	main: {
		options: {
			type:	'bar',
			class:	'app-menu'
		},
		structure:	[
			{
				label: 		__('_File'),
				submenu:	[
					{
						index:		'mainNew',
						label:		__('_New'),
						callback:	null,
					},{	label:	'-'	},{	
						index:		'mainOpen',
						label:		__('_Open'),
						callback:	null,
					},{
						index:		'mainClose',
						label:		__('_Close'),
						callback:	null,
					},{	label:	'-'	},{
						index:		'mainDownload',
						label:		__('_Download book'),
						callback:	null,
					},{
						index:		'mainDownloadHtml',
						label:		__('Download _HTML'),
						callback:	null,
					}
				]	//	File
			},{
				index:		'mainEdit',
				label: 		__('_Edit'),
				submenu: [
					{
						index:		'mainEditMode',
						icon: '<span class="icon">&#xf040;<!-- fa-pencil --></span>',
						label:		__('_Edit mode'),
						callback:	WN.App.prototype.editMode,
					},{	label:	'-'	},{
						index:		'mainAddPage',
						label:		__('Add new _page'),
						callback:	null,
					},{	label:	'-'	},{
						index:		'mainAddSection',
						label:		__('Add new _section'),
						callback:	null,
					}
				]	//	Edit
			}
		]
	},	//	main

	//	Footer left side menus
	switchNavs:	{
		options: {
			place:	'left',
			type:	'bar',
			onlyIcon: 'true',
			class:	'status-left'
		},
		structure:	[
			{
				index:	'statusShowNav',
				icon:	'<span class="icon">&#xf0c9;<!-- fa-navicon --></span>',
				label:	'Show navigator',
				callback:	null
			}
		]
	},	//	switchNavs
	
	//	Footer right side menus
	switchEdit: {
		options: {
			place:	'right',
			type:	'bar',
			onlyIcon: 'true',
			class:	'status-edit-switch'
		},
		structure:	[
			{
				index:	'statusEditMode',
				icon: '<span class="icon">&#xf040;<!-- fa-pencil --></span>',
				label:	'Turn edit mode on',
				callback:	WN.App.prototype.editMode
			}
		]
	}	//	switchEdit
};
