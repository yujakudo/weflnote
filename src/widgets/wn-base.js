var curPageElm = null;
//	selectPage
function selectPage(elm) {
	var pages = document.querySelectorAll(Note.template.page.tag);
	if(elm instanceof HTMLElement) elm = elm.closest(Note.template.page.tag);
	else if(typeof elm==='number') elm = pages.item(elm);
	else elm = document.getElementById(elm);
	if(!elm) elm = pages.item(0);
	if(!elm || curPageElm===elm) return false;
	if(curPageElm) curPageElm.classList.remove('wn-book-selected');
	else for(var i=0; i<pages.length; i++) pages[i].classList.remove('wn-book-selected');
	curPageElm = elm;
	curPageElm.classList.add('wn-book-selected');
	return true;
}

document.getElementsByTagName('a')
.addEventListener('click', function(event){
	var href = event.currentTarget.getAttribute('href');
	var elm = (href.indexOf(0)!=='#')? document.getElementById(href.substr(1)): null;
	if(!elm) return;
	var style = document.body.style;
	selectPage(elm);
	var rect = elm.getBoundingClientRect();
	var xFrom = window.pageXOffset;
	var yFrom = window.pageYOffset;
	var xTo = rect.left + window.pageXOffset;
	var yTo = rect.top + window.pageYOffset;
	window.scrollTo(xTo, yTo);
	style.transition = '';
	style.marginTop = (yFrom - yTo)+'px';
	style.marginLeft = (xFrom - xTo)+'px';
	style.transition = "margin-top 500 ease-in-out, margin-left 500 ease-in-out";
	style.marginTop = style.marginLeft = '0';
	event.preventDefault();
}, false);

window.addEventListener('load', function(){
	selectPage(0);
}, false);
