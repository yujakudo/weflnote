var BACKUP_SIZE = 10;

if(WN.config===undefined) {
WN.config = {};
	switch(ENV) {
		case "dev":
			WN.config.title = 'weflnote Dev';
			WN.config.paths = {
				widgetsRoot:    "../src/widgets",
				templatesRoot:  "../src/templates",
				contentsRoot:    "../src/contents",
			};
		break;
		case "local":
			WN.config.title = 'weflnote App';
			WN.config.paths = {
				widgetsRoot:    "./widgets",
				templatesRoot:  "./templates",
				contentsRoot:    "./contents",
			};
		break;
		default:
			WN.config.title = 'weflnote Web';
			WN.config.paths = {
				widgetsRoot:    "http://www.yujakudo.com/welfnote/widgets",
				templatesRoot:  "http://www.yujakudo.com/welfnote/templates",
				contentsRoot:    "http://www.yujakudo.com/welfnote/contents",
			};
	}
}

yjd.atm(function() {
	for(var prop in WN.config.paths) {
		WN.config.paths[prop] = yjd.getAbsoluteUrl(WN.config.paths[prop]);
	}
	var App = new WN.App();
	if(FirstOpenFile) App.open(FirstOpenFile);
//	App.open('content/content2.html');
});
