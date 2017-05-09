var BACKUP_SIZE = 10;
var App = new WN.App();
var Loader = new yjd.Loader();

yjd.atm(function () {
	Loader.startLoad(finishLoading);
});

function finishLoading(b_ok) {
	if(b_ok) {
		App.open('content/content.html');
	} else {
		var msg = _('error occurred when loading. ')+'<button>'+_('retry')+'</button>';
		App.statusMsg(msg);
		$('#app-status button').click(function(){
			yjd.Loader.retry(finishLoading);
		});
	}
}

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

function bindBookEvent(onoff) {
	if(onoff===undefined) onoff = true;
	if(onoff) {
		$('#book').on('input', '.hot-edit', function() {
			$(this).height(this.scrollHeight);
		});
/*		$('#book').on('keypress', '.hot-edit', function(event) {
			if(event.keyCode==27) {
				$(this).text($(this).data('org'));
				$(this).blur();
			}
		});
*/		$('#book').on('click', 'h1,h2,h3,h4,h5,h6,p,li,address', function() {
			var $h = $(this);
			if($h.children('input,textarea')[0])	return;
			var tag = this.nodeName.toLowerCase();
			var text = $h.html();
			var org_text = text;
			$input = null;
			if(tag.match(/^h\d$/)) {
				$h.html('<input class="hot-edit" type="text" />');
				$input  = $h.children('input');
			} else {
				text = text.replace(/\s+/g, ' ');
				text = text.replace(/<\s*br\s*\/?>/g, "\n");
				$h.html('<textarea class="hot-edit"></textarea>');
				$input  = $h.children('textarea');
				$input.css('height', $h.height);
			}
			$input.data('org', text).focus().val(text);
			$input.on('change blur', function(event){
				var text = $(this).val();
//				if(text!==$(this).data('org'))	backupPage();
				if(event.type==='change') {
					backupPage();
				} else {
					text = $(this).data('org');
				}
				if(tag.match(/^h\d$/)) {
					$h.text(text);
				} else {
					text2para($h, text, tag);
				}
			});
		}); 
	} else {
		$('#book').off('input', '.hot-edit');
		$('#book').off('click', 'h1,h2,h3,h4,h5,h6,p,li,address');
	}
}

function text2para($p, text, tag) {
	text = text.replace(/\r\n|\r/g, "\n");
	var lines = text.split("\n");
	var str = '';
	var paras = [];
	while(lines.length ) {
		var line = lines.shift();
		if(line==='' && str!=='') {
			paras.push(str);
			str = '';
		} else {
			if(str!=='')	str += '<br/>';
			str += line;
		}
	}
	if(str!=='')	paras.push(str);
	if(paras.length===0)	{
		$p.remove();
	} else {
		var pre = '<'+tag+'>';
		var post = '</'+tag+'>';
		while(paras.length>1) {
			var para = paras.pop();
			$p.after(pre+para+post);
		}
		$p.replaceWith(pre+paras[0]+post);
	} 
}
