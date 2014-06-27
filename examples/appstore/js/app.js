rivets.formatters.indexPlus = function(index) {
	return index + 1;
};
window.addEventListener('HTMLImportsLoaded', function(e) {
	document.body.style.visibility = "visible";
});
$(function() {

	(function() {
		var $input = $("#search-input");
		var $ajax2 = $("#ajax2");
		$("#search-form").bind("submit", function() {

			$ajax2.attr("params", '{"page":"' + $input.val() + '"}');

			return false;
		});
	})();

	var isloaded = false;

	window.addEventListener('HTMLImportsLoaded', function(e) {

		var page = 0;

		var refresher = $("#refresher").bind("refresh", function() {
			listTempl.mode = "replace";
			page = 0;
			listTempl.params = '{"page":' + page + '}';

		}).get(0);

		var scroller = $("#scroller").bind("infinite", function() {

			listTempl.mode = "prepend";
			page++;
			listTempl.params = '{"page":' + page + '}';

		}).get(0);

		var listTempl = $("#list-template").bind("data-change", function() {
			console.info("change");
			
			refresher.refreshComplete();
			scroller.infiniteComplete();

		}).get(0);

	});

});
