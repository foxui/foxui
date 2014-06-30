rivets.formatters.indexPlus = function(index) {
	return index + 1;
};
window.addEventListener('HTMLImportsLoaded', function(e) {
	document.body.style.visibility = "visible";
});
$(function() {
	$('body').on('touchmove', function (e) {
         if (!$('fox-page-content').has($(e.target)).length) e.preventDefault();
	 });
	(function() {
		var $input = $("#search-input");
		var $ajax2 = $("#ajax2");
		$("#search-form").bind("submit", function() {

			$ajax2.attr("params", '{"kw":"' + $input.val() + '"}');

			return false;
		});
	})();

	var isloaded = false;

	window.addEventListener('HTMLImportsLoaded', function(e) {

		var page = 1;

		// var refresher = $("#refresher").bind("refresh", function() {
			// listTempl.mode = "replace";
			// page = 1;
			// listTempl.params = '{"pn":' + page + '}';
// 
		// }).get(0);

		var scroller = $("#scroller").bind("infinite", function() {

			listTempl.mode = "append";
			page++;
			listTempl.params = '{"pn":' + page + '}';

		}).get(0);

		var listTempl = $("#list-template").bind("data-change", function() {
			console.info("change");
			
			// refresher.refreshComplete();
			scroller.infiniteComplete();

		}).get(0);

	});

});
