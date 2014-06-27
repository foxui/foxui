rivets.formatters.indexPlus = function(index){
	return index+1;
}
window.addEventListener('HTMLImportsLoaded', function(e) {
	document.body.style.visibility = "visible";
});
$(function(){
	
	$("#search-input").bind("blur",function(){
		$("#ajax2").attr("params",'{"page":"'+this.value+'"}');
	});

})
