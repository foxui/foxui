rivets.formatters.indexPlus = function(index) {
	return index + 1;
};
window.addEventListener('HTMLImportsLoaded', function(e) {
	document.body.style.visibility = "visible";
});

var Utils = (function(){
	
	function MapData(params){

		var contents = params.content;
		var projection = new BMap.MercatorProjection();
		
		function pointTolngLat(x,y){
			return projection.pointToLngLat(new BMap.Pixel(x,y));
		}
		
		function toData(content){
			var lnglat = pointTolngLat(content.x,content.y);
			return {
				panorama:"panorama.html?lng="+lnglat.lng+"&lat="+lnglat.lat,
				name : content.name,
				price : content.price,
				loc : content.metro_distance,
				time : content.bus_time,
				thumbnail : ""
			};
		}
		
		
		this.getDetailList = function(){
			var res = [];
			contents.forEach(function(content){
				res.push(toData(content));
			});
			
			return {
				count:params.total_res_num,
				list:res
			};
		};
		
		this.getJSON = function(){
			return contents;
		};
		
		this.getGeoList = function(){
			var res = [];
			contents.forEach(function(content){
				 var list =  content.geo.split(",");
				 var arr = [];
				 for(var i = 0;i<list.length;i+=2){
				 	arr.push(pointTolngLat(list[i],list[i+1]));
				 }
				 res.push(arr);
			});
			return res;
		};
		
		this.getHeatList = function(){
			var res = [];
			contents.forEach(function(content){
				var lnglat = pointTolngLat(content.x,content.y);
				
				res.push({
						"lng":lnglat.lng,
						"lat":lnglat.lat,
						"count":parseFloat(content.live_num_ratio)*2000
					});
				
			});
			return res;
		};
		this.getPointList = function(){
			var res = [];
			contents.forEach(function(content){
				res.push({
					point:pointTolngLat(content.x,content.y),
					data:toData(content)
				});
			});
			return res;
		};
	}
	
	
	function DetailData(json){
		
		this.getJSON = function(){
			return json;
		};
		
		this.getDetailModel = function(){
			var ext = json.ext;
			var info = ext.detail_info;
			return {
				"name":json.name,
				"price":info.price,
				"rent_price":info.rent_price,
				"house_type":info.house_type,
				"house_year":info.building_time,
				"building_type":info.building_type,
				"volume_rate":info.volume_rate,
				"property_management_fee":info.property_management_fee,
				"property_company":info.property_company,
				"developers":info.developers,
				"thumbnail":info.image
			};
		};
		
	}
	
	return {
		getURLParams:function(){
			
			var d = /\?(.*)/.exec(location.href);
			var res = {};
			if(d){
				d[1].split("&").forEach(function(param){
					var pair = param.split("=");
					res[pair[0]] = pair[1];
				});
			}
			return res;
			
		},
		getDetailData:function(uid,callback){
			$.getJSON("http://map.baidu.com/detail?qt=ninf&callback=?",{
				uid:"08fc93df22f91d919a68b4ab"
			},function(res){
				
				callback&&callback(new DetailData(res.content));
			});
		},
		
		getMapData:function(lng,lat,page,callback){
			function fireCallback(data){
				callback&&callback(data);
			};
			var cache = {};
			var cachekey = JSON.stringify({
				"lng":lng,
				"lat":lat,
				"page":page
			});
			var cacheData = cache[cachekey];
			if(cacheData){
				fireCallback(cacheData);
			}else{
				$.getJSON("http://db-rdqa-poo199.db01.baidu.com:8969/house/data/index.php?callback=?",{
					"crd":"12947504.86,4846455.96",
					"sort_live_ratio":0,
					"page_num":page
				},function(res){
					cacheData = new MapData(res);
					cache[cachekey] = cacheData;
					fireCallback(cacheData);
				});
			}
			
		}
	};
})();

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

