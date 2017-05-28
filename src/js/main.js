var BACKUP_SIZE = 10;

yjd.atm(function() {
	var App = new WN.App();
	App.open('content/content.html');
//	App.open('content/content2.html');
});

function onReady() {
	bindBookEvent();

    var options = {
        cellHeight: 80,
        verticalMargin: 10,
		minWidth: 480,
		removable: true,
        float: true,
		width: 12
    };
    $('.grid-stack').gridstack(options);
}
