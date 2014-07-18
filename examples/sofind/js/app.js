rivets.formatters.indexPlus = function(index) {
	return index + 1;
};
window.addEventListener('HTMLImportsLoaded', function(e) {
	document.body.style.visibility = "visible";
});

var geoAPI = (function() {

	return {

		"geoToAddress" : function(coor, callback) {
			$.getJSON("http://api.map.baidu.com/geocoder?output=json&location=" + coor[0] + ",%20" + coor[1] + "&key=37492c0ee6f924cb5e934fa08c6b1676", function(res) {
				callback && callback(res);
			});
		},
		"addressToGeo" : function(address, callback) {
			callback && callback({
				status : "OK",
				result : {
					location : {
						lng : 116.403936,
						lat : 39.912094
					},
					precise : 0,
					confidence : 40,
					level : ""
				}
			});

			/*
			 $.getJSON("http://api.map.baidu.com/geocoder?address="+address+"&output=json&key=37492c0ee6f924cb5e934fa08c6b1676&city=%E5%8C%97%E4%BA%AC%E5%B8%82",function(res){
			 callback&&callback(res);
			 });*/

		}
	};

})();

$(function() {
	FastClick.attach(document.body);
});

