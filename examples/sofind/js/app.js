rivets.formatters.indexPlus = function(index) {
	return index + 1;
};
rivets.binders['style-width-percent'] = function(el, value) {
	el.style["width"] = parseInt(value)+"%";
};
rivets.formatters.transferFormatter = function(val) {
	if(val == 0){
		return "直达";
	}else{
		return val+"次换乘";
	}
};
rivets.formatters.detailFormatter = function(val) {
	if(val){
		return val;
	}else{
		return "无";
	}
};


rivets.binders['background-image-resize'] = function(el, value) {
	var ratio = window.devicePixelRatio ? devicePixelRatio : 1;
	
	var width = $(el).width()*ratio;
	var height = $(el).height()*ratio;
	var url = "http://map.baidu.com/maps/services/thumbnails?src="+value+"&fm=22&width="+width+"&height="+height+"&align=center";
	
	el.style["backgroundImage"] = "url(" + url + ")";
};


window.addEventListener('HTMLImportsLoaded', function(e) {
	document.body.style.visibility = "visible";
});

var Utils = (function() {

	// var projection = new BMap.MercatorProjection();

	function pointTolngLat(x, y) {
		return  MercatorProjection.convertMC2LL(new BMap.Point(x, y));
		// return projection.pointToLngLat(new BMap.Pixel(x,y));
	}

	function lnglatToPoint(lng, lat) {
		return MercatorProjection.convertLL2MC(new BMap.Point(lng, lat));
		// return projection.lngLatToPoint(new BMap.Point(lng, lat));
	}

	function toData(content) {
		var lnglat = pointTolngLat(content.x, content.y);
		return {
			bid:content.bid,
			panorama : "panorama.html?uid="+content.bid,
			name : content.name,
			price : content.price,
			home2work_distr_normaliezd:content.home2work_distr_normaliezd==""?[]:content.home2work_distr_normaliezd.split(","),
			work2home_distr_normaliezd:content.work2home_distr_normaliezd==""?[]:content.work2home_distr_normaliezd.split(","),
			loc : content.metro_distance,
			time : content.bus_time,
			thumbnail : "",
			metro_name:content.metro_name,
			metro_stop_name:content.metro_stop_name,
			transfer1:content.transfer,
			distance:content.distance,
			detailLink:"detail.html?uid="+content.bid,
			x:content.x,
			y:content.y,
			hasChart:content.home2work_distr_normaliezd!=""&&content.work2home_distr_normaliezd!="",
			hotspot:content.live_num_ratio_normalized
		};
	}

	function MapData(params) {

		var contents = params.content;

		


		this.getDetailList = function() {
			var res = [];
			contents.forEach(function(content) {
				res.push(toData(content));
			});

			return {
				count : params.total_res_num,
				list : res
			};
		};

		this.getJSON = function() {
			return contents;
		};

		this.getGeoList = function() {
			var res = [];
			contents.forEach(function(content) {
				var list = content.geo.split(",");
				var arr = [];
				for (var i = 0; i < list.length; i += 2) {
					arr.push(new BMap.Point(list[i], list[i + 1]));
				}
				res.push({
					"bid":content.bid,
					"arr":arr
				});
			});
			console.info(res);
			return res;
		};

		this.getHeatList = function() {
			var res = [];
			contents.forEach(function(content) {
				var lnglat = pointTolngLat(content.x, content.y);

				res.push({
					"lng" : lnglat.lng,
					"lat" : lnglat.lat,
					"count" : parseFloat(content.live_num_ratio) * 2000
				});

			});
			return res;
		};
		this.getPointList = function() {
			var res = [];
			contents.forEach(function(content) {
				res.push({
					point : new BMap.Point(content.x, content.y),
					data : toData(content)
				});
			});
			return res;
		};
	}

	function DetailData(json) {

		this.getJSON = function() {
			return json;
		};

		this.getDetailModel = function() {
			var ext = json.ext;
			var info = ext.detail_info;
			return {
				"name" : json.name,
				"price" : info.price,
				"rent_price" : info.rent_price,
				"house_type" : info.house_type,
				"house_year" : info.building_time,
				"building_type" : info.building_type,
				"volume_rate" : info.volume_rate,
				"property_management_fee" : info.property_management_fee,
				"property_company" : info.property_company,
				"developers" : info.developers,
				"thumbnail" : info.image
			};
		};

	}

	function SugData(json) {

		this.getList = function() {
			var arr = [];
			json.s.forEach(function(line) {
				var origin = /^\$\$\$([^\$]+)/.exec(line);
				if (origin) {
					arr.push({
						name : origin[1]
					});
				} else {

					var detail = /^([^\$]+)\$([^\$]+)\$\$([^\$]+)\$/.exec(line);
					if (detail) {

						arr.push({
							name : detail[3],
							city : detail[1] + detail[2]
						});
					}
				}
			});
			return arr;
		};
	}

	var contentCache = {};

	return {

		getContent:function(bid){
			return contentCache[bid];
		},

		getURLParams : function() {

			var d = /\?(.*)/.exec(location.href);
			var res = {};
			if (d) {
				d[1].split("&").forEach(function(param) {
					var pair = param.split("=");
					res[pair[0]] = pair[1];
				});
			}
			return res;

		},
		getGeoPoint : function(address, city, callback) {
			$.getJSON("http://api.map.baidu.com/geocoder/v2/?address=" + address + "&city=" + city + "&output=json&ak=hmPxdBHxPZvZU2x3RN9SSKGt&callback=?", function(res) {
				var point = null;
				if(res.status == 0){
					var loc = res.result.location;
					callback&&callback(MercatorProjection.convertLL2MC(loc));	
				}
				
			});
		},
		getGeoAddress:function(lng,lat,callback){
			$.getJSON("http://api.map.baidu.com/geocoder/v2/?ak=hmPxdBHxPZvZU2x3RN9SSKGt&callback=?&location="+lat+","+lng+"&output=json&pois=0", function(res) {
				callback&&callback(res);
				
				
			});
		},
		getGeoLocation:function(callback){
			/*var coords = {
				longitude:116.322987,
				"latitude":39.983424
			};
			*/
			var me = this;
			
			if (navigator.geolocation) {

				navigator.geolocation.getCurrentPosition(function(geo){
					var coords = geo.coords;
					var point = Utils.lnglatToPoint(coords.longitude, coords.latitude);

					me.getGeoAddress(coords.longitude, coords.latitude,function(res){

						var rs = res.result;
						callback&&callback({
							point:{
								lng:coords.longitude,
								lat:coords.latitude,
							},
							address:res.result.formatted_address,
							pixel:{
								x:point.lng,
								y:point.lat
							}
							
							
						});
					});
					
				});
			}else{
				callback&&callback(null);
			}
			
			
			
			
		},
		getSugData : function(val, callback) {
			$.getJSON("http://map.baidu.com/su?wd=" + val + "&callback=?&cid=1&type=0&newmap=1", {

			}, function(res) {
				callback && callback(new SugData(res));
			});
		},
		getDetailData : function(uid, callback) {
			$.getJSON("http://map.baidu.com/detail?qt=ninf&callback=?", {
				uid :uid
			}, function(res) {

				callback && callback(new DetailData(res.content));
			});
		},

		getMapData : function(lng, lat, page, callback) {
			function fireCallback(data) {
				callback && callback(data);
			};
			var cache = {};
			var cachekey = JSON.stringify({
				"lng" : lng,
				"lat" : lat,
				"page" : page
			});
			var cacheData = cache[cachekey];
			if (cacheData) {
				fireCallback(cacheData);
			} else {
				

				$.getJSON("http://cp01-rdqa-pool388.cp01.baidu.com:8967/house/data/index.php?callback=?", {
					"crd" : lng + "," + lat,
					"sort_live_ratio" : 0,
					"page_num" : page
				}, function(res) {
					cacheData = new MapData(res);
					res.content.forEach(function(obj){
						contentCache[obj.bid] = toData(obj);
					});
					
					cache[cachekey] = cacheData;
					fireCallback(cacheData);
				});
			}

		},
		lnglatToPoint:lnglatToPoint
	};
})();

// 静态常量
(function() {
	var Point = function(x, y) {
		this.lng = x; 
		this.lat = y;
	};

	window.MercatorProjection = {
		EARTHRADIUS : 6370996.81,
		MCBAND : [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0],
		LLBAND : [75, 60, 45, 30, 15, 0],
		MC2LL : [[1.410526172116255e-008, 8.983055096488720e-006, -1.99398338163310, 2.009824383106796e+002, -1.872403703815547e+002, 91.60875166698430, -23.38765649603339, 2.57121317296198, -0.03801003308653, 1.733798120000000e+007], [-7.435856389565537e-009, 8.983055097726239e-006, -0.78625201886289, 96.32687599759846, -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375, 1.026014486000000e+007], [-3.030883460898826e-008, 8.983055099835780e-006, 0.30071316287616, 59.74293618442277, 7.35798407487100, -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6.856817370000000e+006], [-1.981981304930552e-008, 8.983055099779535e-006, 0.03278182852591, 40.31678527705744, 0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561, 4.482777060000000e+006], [3.091913710684370e-009, 8.983055096812155e-006, 0.00006995724062, 23.10934304144901, -0.00023663490511, -0.63218178102420, -0.00663494467273, 0.03430082397953, -0.00466043876332, 2.555164400000000e+006], [2.890871144776878e-009, 8.983055095805407e-006, -0.00000003068298, 7.47137025468032, -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364, 8.260885000000000e+005]],
		LL2MC : [[-0.00157021024440, 1.113207020616939e+005, 1.704480524535203e+015, -1.033898737604234e+016, 2.611266785660388e+016, -3.514966917665370e+016, 2.659570071840392e+016, -1.072501245418824e+016, 1.800819912950474e+015, 82.5], [8.277824516172526e-004, 1.113207020463578e+005, 6.477955746671608e+008, -4.082003173641316e+009, 1.077490566351142e+010, -1.517187553151559e+010, 1.205306533862167e+010, -5.124939663577472e+009, 9.133119359512032e+008, 67.5], [0.00337398766765, 1.113207020202162e+005, 4.481351045890365e+006, -2.339375119931662e+007, 7.968221547186455e+007, -1.159649932797253e+008, 9.723671115602145e+007, -4.366194633752821e+007, 8.477230501135234e+006, 52.5], [0.00220636496208, 1.113207020209128e+005, 5.175186112841131e+004, 3.796837749470245e+006, 9.920137397791013e+005, -1.221952217112870e+006, 1.340652697009075e+006, -6.209436990984312e+005, 1.444169293806241e+005, 37.5], [-3.441963504368392e-004, 1.113207020576856e+005, 2.782353980772752e+002, 2.485758690035394e+006, 6.070750963243378e+003, 5.482118345352118e+004, 9.540606633304236e+003, -2.710553267466450e+003, 1.405483844121726e+003, 22.5], [-3.218135878613132e-004, 1.113207020701615e+005, 0.00369383431289, 8.237256402795718e+005, 0.46104986909093, 2.351343141331292e+003, 1.58060784298199, 8.77738589078284, 0.37238884252424, 7.45]],

		/**
		 * 平面直角坐标转换成经纬度坐标;
		 * @param {Point} point 平面直角坐标
		 * @return {Point} 返回经纬度坐标
		 */

		convertMC2LL : function(point) {
			var temp, factor;
			temp = new Point(Math.abs(point["lng"]), Math.abs(point["lat"]));
			for (var i = 0; i < this.MCBAND.length; i++) {
				if (temp["lat"] >= this.MCBAND[i]) {
					factor = this.MC2LL[i];
					break;
				}
			};
			var lnglat = this.convertor(point, factor);
			var point = new Point(lnglat["lng"].toFixed(6), lnglat["lat"].toFixed(6));
			return point;
		}
		/**
		 * 经纬度坐标转换成平面直角坐标;
		 * @param {Point} point 经纬度坐标
		 * @return {Point} 返回平面直角坐标
		 */,
		convertLL2MC : function(point) {
			var temp, factor;
			point["lng"] = this.getLoop(point["lng"], -180, 180);
			point["lat"] = this.getRange(point["lat"], -74, 74);
			temp = new Point(point["lng"], point["lat"]);
			for (var i = 0; i < this.LLBAND.length; i++) {
				if (temp["lat"] >= this.LLBAND[i]) {
					factor = this.LL2MC[i];
					break;
				}
			}
			if (!factor) {
				for (var i = this.LLBAND.length - 1; i >= 0; i--) {
					if (temp["lat"] <= -this.LLBAND[i]) {
						factor = this.LL2MC[i];
						break;
					}
				}
			}
			var mc = this.convertor(point, factor);
			var point = new Point(mc["lng"].toFixed(2), mc["lat"].toFixed(2));
			return point;
		},
		convertor : function(fromPoint, factor) {
			if (!fromPoint || !factor) {
				return;
			}
			var x = factor[0] + factor[1] * Math.abs(fromPoint["lng"]);
			var temp = Math.abs(fromPoint["lat"]) / factor[9];
			var y = factor[2] + factor[3] * temp + factor[4] * temp * temp + factor[5] * temp * temp * temp + factor[6] * temp * temp * temp * temp + factor[7] * temp * temp * temp * temp * temp + factor[8] * temp * temp * temp * temp * temp * temp;
			x *= (fromPoint["lng"] < 0 ? -1 : 1);
			y *= (fromPoint["lat"] < 0 ? -1 : 1);
			return new Point(x, y);
		},
		getRange : function(v, a, b) {
			if (a != null) {
				v = Math.max(v, a);
			}
			if (b != null) {
				v = Math.min(v, b);
			}
			return v
		},
		getLoop : function(v, a, b) {
			while (v > b) {
				v -= b - a
			}
			while (v < a) {
				v += b - a
			}
			return v;
		}
	};
})();

$(function() {
	FastClick.attach(document.body);
});


function CustomOverlay(point, text,hot) {
	this._point = point;
	this._text = text;
	this._hot = hot;
}


CustomOverlay.prototype = new BMap.Overlay();
CustomOverlay.prototype.initialize = function(map) {
	this._map = map;
	
	var div  = $("<div/>").css({
		"position" : "absolute",
		"z-index" : BMap.Overlay.getZIndex(this._point.lat)
	}).addClass("CustomOverlay").text(this._text);

	if(this._hot > 0){
		div.append("<div class='marker_hot' ><div class='match_parent' style='width:"+this._hot+"%'></div></div>");
	}
	div = this._div = div.get(0);

	map.getPanes().labelPane.appendChild(div);
	return div;
};

CustomOverlay.prototype.draw = function() {
	var map = this._map;
	var pixel = map.pointToOverlayPixel(this._point);
	
	this._div.style.left = pixel.x-10.5+ "px";
	this._div.style.top = pixel.y-30 + "px";
};

CustomOverlay.prototype.addEventListener = function(){
	
	this._div.addEventListener.apply(this._div,arguments);
};

function MyOverlay(point) {
	this._point = point;
	
}
MyOverlay.prototype = new BMap.Overlay();

MyOverlay.prototype.initialize = function(map) {
	this._map = map;
	
	var div = this._div = $("<div class='my_overlay'/>").get(0);
	map.getPanes().labelPane.appendChild(div);
	return div;
};
MyOverlay.prototype.draw = function() {
	var map = this._map;
	var pixel = map.pointToOverlayPixel(this._point);
	
	this._div.style.left = pixel.x-15+ "px";
	this._div.style.top = pixel.y-30 + "px";
};
