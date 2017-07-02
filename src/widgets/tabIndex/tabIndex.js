
document.querySelector(Note.template.index.container)
.addEventListener('click', function(event){
	var elm = event.target;
	while(elm.tagName!=='LI' && elm.tagName!=='UL') elm = elm.parentNode;
	if(elm.tagName!=='LI') return;
	var id = elm.getAttribute('data-id');
	if( selectPage(id) ) window.scrollTo(0,0);
}, false);
