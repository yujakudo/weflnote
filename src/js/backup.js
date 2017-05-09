
function clearPageBackup() {
	localStorage.setItem('backup-idx', 0);
	localStorage.setItem('undo-idx', 0);
	for(var i=0; i<BACKUP_SIZE; i++) {
		localStorage.setItem('backup-'+i, null);
	}
	enableUndoMenu(false, false);
}

function backupPage() {
	var idx = parseInt(localStorage.getItem('backup-idx'));
//	var undo_idx = parseInt(localStorage.getItem('undo-idx'));
	idx = ++idx % BACKUP_SIZE;
	var undo_idx = idx;
	var key = 'backup-'+idx;
	localStorage.setItem(key, $(curPage).html());
	localStorage.setItem('backup-idx', idx);
	localStorage.setItem('undo-idx', undo_idx);
	enableUndoMenu(true, false);
}

function undoPage() {
	var idx = parseInt(localStorage.getItem('backup-idx'));
	var undo_idx = parseInt(localStorage.getItem('undo-idx'));
	idx = idx? idx-1: BACKUP_SIZE-1;
	if(idx==undo_idx) return false;
	var page = localStorage.getItem('backup-'+idx);
	$(curPage).html(page);
	localStorage.setItem('backup-idx', idx);

	var undo = true;
	idx = idx? idx-1: BACKUP_SIZE-1;
	if(idx==undo_idx) undo = false;
	if(idx===0) {
		page = localStorage.getItem('backup-'+idx);
		if(!page) undo = false;
	}
	enableUndoMenu(undo, true);
	return true;
}

function redoPage() {
	var idx = parseInt(localStorage.getItem('backup-idx'));
	var undo_idx = parseInt(localStorage.getItem('undo-idx'));
	if(idx==undo_idx) return false;
	idx = ++idx % BACKUP_SIZE;
	var page = localStorage.getItem('backup-'+idx);
	$(curPage).html(page);
	localStorage.setItem('backup-idx', idx);
	var redo = true;
	if(idx==undo_idx) redo = false;
	enableUndoMenu(true, redo);
	return true;
}

function enableUndoMenu(undo, redo) {
	if(undo) {
		$('#cmd-undo').removeClass('disabled');
	} else {
		$('#cmd-undo').addClass('disabled');
	}
	if(redo) {
		$('#cmd-redo').removeClass('disabled');
	} else {
		$('#cmd-redo').addClass('disabled');
	}
}
