(function() {
	var aa, aK = aa = aK || {
		version : "1.3.4"
	};
	aK.guid = "$BAIDU$";
	window[aK.guid] = window[aK.guid] || {};
	aK.object = aK.object || {};
	aK.extend = aK.object.extend = function(aW, T) {
		for (var aV in T) {
			if (T.hasOwnProperty(aV)) {
				aW[aV] = T[aV]
			}
		}
		return aW
	};
	aK.dom = aK.dom || {};
	aK.dom.g = function(T) {
		if ("string" == typeof T || T instanceof String) {
			return document.getElementById(T)
		} else {
			if (T && T.nodeName && (T.nodeType == 1 || T.nodeType == 9)) {
				return T
			}
		}
		return null
	};
	aK.g = aK.G = aK.dom.g;
	aK.dom.hide = function(T) {
		T = aK.dom.g(T);
		T.style.display = "none";
		return T
	};
	aK.hide = aK.dom.hide;
	aK.lang = aK.lang || {};
	aK.lang.isString = function(T) {
		return "[object String]" == Object.prototype.toString.call(T)
	};
	aK.isString = aK.lang.isString;
	aK.dom._g = function(T) {
		if (aK.lang.isString(T)) {
			return document.getElementById(T)
		}
		return T
	};
	aK._g = aK.dom._g;
	aK.dom.contains = function(T, aV) {
		var aW = aK.dom._g;
		T = aW(T);
		aV = aW(aV);
		return T.contains ? T != aV && T.contains(aV) : !!(T.compareDocumentPosition(aV) & 16)
	};
	aK.browser = aK.browser || {};
	aK.dom._NAME_ATTRS = (function() {
		var T = {
			cellpadding : "cellPadding",
			cellspacing : "cellSpacing",
			colspan : "colSpan",
			rowspan : "rowSpan",
			valign : "vAlign",
			usemap : "useMap",
			frameborder : "frameBorder"
		};
		T.htmlFor = "for";
		T.className = "class";
		return T
	})();
	aK.dom.setAttr = function(aV, T, aW) {
		aV = aK.dom.g(aV);
		if ("style" == T) {
			aV.style.cssText = aW
		} else {
			T = aK.dom._NAME_ATTRS[T] || T;
			aV.setAttribute(T, aW)
		}
		return aV
	};
	aK.setAttr = aK.dom.setAttr;
	aK.dom.setAttrs = function(aW, T) {
		aW = aK.dom.g(aW);
		for (var aV in T) {
			aK.dom.setAttr(aW, aV, T[aV])
		}
		return aW
	};
	aK.setAttrs = aK.dom.setAttrs;
	aK.string = aK.string || {};
	aK.dom.removeClass = function(aZ, a0) {
		aZ = aK.dom.g(aZ);
		var aX = aZ.className.split(/\s+/), a1 = a0.split(/\s+/), aV, T = a1.length, aW, aY = 0;
		for (; aY < T; ++aY) {
			for ( aW = 0, aV = aX.length; aW < aV; ++aW) {
				if (aX[aW] == a1[aY]) {
					aX.splice(aW, 1);
					break
				}
			}
		}
		aZ.className = aX.join(" ");
		return aZ
	};
	aK.removeClass = aK.dom.removeClass;
	aK.dom.insertHTML = function(aX, T, aW) {
		aX = aK.dom.g(aX);
		var aV, aY;
		if (aX.insertAdjacentHTML) {
			aX.insertAdjacentHTML(T, aW)
		} else {
			aV = aX.ownerDocument.createRange();
			T = T.toUpperCase();
			if (T == "AFTERBEGIN" || T == "BEFOREEND") {
				aV.selectNodeContents(aX);
				aV.collapse(T == "AFTERBEGIN")
			} else {
				aY = T == "BEFOREBEGIN";
				aV[aY?"setStartBefore":"setEndAfter"](aX);
				aV.collapse(aY)
			}
			aV.insertNode(aV.createContextualFragment(aW))
		}
		return aX
	};
	aK.insertHTML = aK.dom.insertHTML;
	aK.dom.show = function(T) {
		T = aK.dom.g(T);
		T.style.display = "";
		return T
	};
	aK.show = aK.dom.show;
	aK.dom.getDocument = function(T) {
		T = aK.dom.g(T);
		return T.nodeType == 9 ? T : T.ownerDocument || T.document
	};
	aK.dom.addClass = function(aZ, a0) {
		aZ = aK.dom.g(aZ);
		var aV = a0.split(/\s+/), T = aZ.className, aY = " " + T + " ", aX = 0, aW = aV.length;
		for (; aX < aW; aX++) {
			if (aY.indexOf(" " + aV[aX] + " ") < 0) {
				T += " " + aV[aX]
			}
		}
		aZ.className = T;
		return aZ
	};
	aK.addClass = aK.dom.addClass;
	aK.dom._styleFixer = aK.dom._styleFixer || {};
	aK.dom._styleFilter = aK.dom._styleFilter || [];
	aK.dom._styleFilter.filter = function(aV, aY, aZ) {
		for (var T = 0, aX = aK.dom._styleFilter, aW; aW = aX[T]; T++) {
			if ( aW = aW[aZ]) {
				aY = aW(aV, aY)
			}
		}
		return aY
	};
	aK.string.toCamelCase = function(T) {
		if (T.indexOf("-") < 0 && T.indexOf("_") < 0) {
			return T
		}
		return T.replace(/[-_][^-_]/g, function(aV) {
			return aV.charAt(1).toUpperCase()
		})
	};
	aK.dom.getStyle = function(aW, aV) {
		var aZ = aK.dom;
		aW = aZ.g(aW);
		aV = aK.string.toCamelCase(aV);
		var aY = aW.style[aV];
		if (!aY) {
			var T = aZ._styleFixer[aV], aX = aW.currentStyle || getComputedStyle(aW, null);
			aY = T && T.get ? T.get(aW, aX) : aX[T || aV]
		}
		if ( T = aZ._styleFilter) {
			aY = T.filter(aV, aY, "get")
		}
		return aY
	};
	aK.getStyle = aK.dom.getStyle;
	if (/opera\/(\d+\.\d)/i.test(navigator.userAgent)) {
		aK.browser.opera = +RegExp["\x241"]
	}
	aK.browser.isWebkit = /webkit/i.test(navigator.userAgent);
	aK.browser.isGecko = /gecko/i.test(navigator.userAgent) && !/like gecko/i.test(navigator.userAgent);
	aK.browser.isStrict = document.compatMode == "CSS1Compat";
	aK.dom.getPosition = function(T) {
		T = aK.dom.g(T);
		var a3 = aK.dom.getDocument(T), aX = aK.browser, a0 = aK.dom.getStyle, aW = aX.isGecko > 0 && a3.getBoxObjectFor && a0(T, "position") == "absolute" && (T.style.top === "" || T.style.left === ""), a1 = {
			left : 0,
			top : 0
		}, aZ = (aX.ie && !aX.isStrict) ? a3.body : a3.documentElement, a4, aV;
		if (T == aZ) {
			return a1
		}
		if (T.getBoundingClientRect) {
			aV = T.getBoundingClientRect();
			a1.left = Math.floor(aV.left) + Math.max(a3.documentElement.scrollLeft, a3.body.scrollLeft);
			a1.top = Math.floor(aV.top) + Math.max(a3.documentElement.scrollTop, a3.body.scrollTop);
			a1.left -= a3.documentElement.clientLeft;
			a1.top -= a3.documentElement.clientTop;
			var a2 = a3.body, a5 = parseInt(a0(a2, "borderLeftWidth")), aY = parseInt(a0(a2, "borderTopWidth"));
			if (aX.ie && !aX.isStrict) {
				a1.left -= isNaN(a5) ? 2 : a5;
				a1.top -= isNaN(aY) ? 2 : aY
			}
		} else {
			a4 = T;
			do {
				a1.left += a4.offsetLeft;
				a1.top += a4.offsetTop;
				if (aX.isWebkit > 0 && a0(a4, "position") == "fixed") {
					a1.left += a3.body.scrollLeft;
					a1.top += a3.body.scrollTop;
					break
				}
				a4 = a4.offsetParent
			} while(a4&&a4!=T);
			if (aX.opera > 0 || (aX.isWebkit > 0 && a0(T, "position") == "absolute")) {
				a1.top -= a3.body.offsetTop
			}
			a4 = T.offsetParent;
			while (a4 && a4 != a3.body) {
				a1.left -= a4.scrollLeft;
				if (!aX.opera || a4.tagName != "TR") {
					a1.top -= a4.scrollTop
				}
				a4 = a4.offsetParent
			}
		}
		return a1
	};
	if (/firefox\/(\d+\.\d)/i.test(navigator.userAgent)) {
		aK.browser.firefox = +RegExp["\x241"]
	}
	(function() {
		var T = navigator.userAgent;
		if (/(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(T) && !/chrome/i.test(T)) {
			aK.browser.safari = +(RegExp["\x241"] || RegExp["\x242"])
		}
	})();
	if (/chrome\/(\d+\.\d)/i.test(navigator.userAgent)) {
		aK.browser.chrome = +RegExp["\x241"]
	}
	aK.array = aK.array || {};
	aK.array.each = function(aZ, aX) {
		var aW, aY, aV, T = aZ.length;
		if ("function" == typeof aX) {
			for ( aV = 0; aV < T; aV++) {
				aY = aZ[aV];
				aW = aX.call(aZ, aY, aV);
				if (aW === false) {
					break
				}
			}
		}
		return aZ
	};
	aK.each = aK.array.each;
	aK.lang.guid = function() {
		return "TANGRAM__" + (window[aK.guid]._counter++).toString(36)
	};
	window[aK.guid]._counter = window[aK.guid]._counter || 1;
	window[aK.guid]._instances = window[aK.guid]._instances || {};
	aK.lang.isFunction = function(T) {
		return "[object Function]" == Object.prototype.toString.call(T)
	};
	aK.lang.Class = function(T) {
		this.guid = T || aK.lang.guid();
		window[aK.guid]._instances[this.guid] = this
	};
	window[aK.guid]._instances = window[aK.guid]._instances || {};
	aK.lang.Class.prototype.dispose = function() {
		delete window[aK.guid]._instances[this.guid];
		for (var T in this) {
			if (!aK.lang.isFunction(this[T])) {
				delete this[T]
			}
		}
		this.disposed = true
	};
	aK.lang.Class.prototype.toString = function() {
		return "[object " + (this._className || "Object") + "]"
	};
	aK.lang.Event = function(T, aV) {
		this.type = T;
		this.returnValue = true;
		this.target = aV || null;
		this.currentTarget = null
	};
	aK.lang.Class.prototype.addEventListener = function(aX, aW, aV) {
		if (!aK.lang.isFunction(aW)) {
			return
		}
		!this.__listeners && (this.__listeners = {});
		var T = this.__listeners, aY;
		if ( typeof aV == "string" && aV) {
			if (/[^\w\-]/.test(aV)) {
				throw ("nonstandard key:" + aV)
			} else {
				aW.hashCode = aV;
				aY = aV
			}
		}
		aX.indexOf("on") != 0 && ( aX = "on" + aX);
		typeof T[aX] != "object" && (T[aX] = {});
		aY = aY || aK.lang.guid();
		aW.hashCode = aY;
		T[aX][aY] = aW
	};
	aK.lang.Class.prototype.removeEventListener = function(aW, aV) {
		if (aK.lang.isFunction(aV)) {
			aV = aV.hashCode
		} else {
			if (!aK.lang.isString(aV)) {
				return
			}
		}
		!this.__listeners && (this.__listeners = {});
		aW.indexOf("on") != 0 && ( aW = "on" + aW);
		var T = this.__listeners;
		if (!T[aW]) {
			return
		}
		T[aW][aV] &&
		delete T[aW][aV]
	};
	aK.lang.Class.prototype.dispatchEvent = function(aX, T) {
		if (aK.lang.isString(aX)) {
			aX = new aK.lang.Event(aX)
		}
		!this.__listeners && (this.__listeners = {});
		T = T || {};
		for (var aW in T) {
			aX[aW] = T[aW]
		}
		var aW, aV = this.__listeners, aY = aX.type;
		aX.target = aX.target || this;
		aX.currentTarget = this;
		aY.indexOf("on") != 0 && ( aY = "on" + aY);
		aK.lang.isFunction(this[aY]) && this[aY].apply(this, arguments);
		if ( typeof aV[aY] == "object") {
			for (aW in aV[aY]) {
				aV[aY][aW].apply(this, arguments)
			}
		}
		return aX.returnValue
	};
	aK.lang.inherits = function(a0, aY, aX) {
		var aW, aZ, T = a0.prototype, aV = new Function();
		aV.prototype = aY.prototype;
		aZ = a0.prototype = new aV();
		for (aW in T) {
			aZ[aW] = T[aW]
		}
		a0.prototype.constructor = a0;
		a0.superClass = aY.prototype;
		if ("string" == typeof aX) {
			aZ._className = aX
		}
	};
	aK.inherits = aK.lang.inherits;
	aK.lang.instance = function(T) {
		return window[aK.guid]._instances[T] || null
	};
	aK.platform = aK.platform || {};
	aK.platform.isAndroid = /android/i.test(navigator.userAgent);
	if (/android (\d+\.\d)/i.test(navigator.userAgent)) {
		aK.platform.android = aK.android = RegExp["\x241"]
	}
	aK.platform.isIpad = /ipad/i.test(navigator.userAgent);
	aK.platform.isIphone = /iphone/i.test(navigator.userAgent);
	aK.platform.iosVersion = /iphone os (\d)\_/i.test(navigator.userAgent) ? +RegExp["\x241"] : 0;
	aK.lang.Event.prototype.inherit = function(aW) {
		var aV = this;
		this.domEvent = aW = window.event || aW;
		aV.clientX = aW.clientX || aW.pageX;
		aV.clientY = aW.clientY || aW.pageY;
		aV.offsetX = aW.offsetX || aW.layerX;
		aV.offsetY = aW.offsetY || aW.layerY;
		aV.screenX = aW.screenX;
		aV.screenY = aW.screenY;
		aV.ctrlKey = aW.ctrlKey || aW.metaKey;
		aV.shiftKey = aW.shiftKey;
		aV.altKey = aW.altKey;
		if (aW.touches) {
			aV.touches = [];
			for (var T = 0; T < aW.touches.length; T++) {
				aV.touches.push({
					clientX : aW.touches[T].clientX,
					clientY : aW.touches[T].clientY,
					screenX : aW.touches[T].screenX,
					screenY : aW.touches[T].screenY,
					pageX : aW.touches[T].pageX,
					pageY : aW.touches[T].pageY,
					target : aW.touches[T].target,
					identifier : aW.touches[T].identifier
				})
			}
		}
		if (aW.changedTouches) {
			aV.changedTouches = [];
			for (var T = 0; T < aW.changedTouches.length; T++) {
				aV.changedTouches.push({
					clientX : aW.changedTouches[T].clientX,
					clientY : aW.changedTouches[T].clientY,
					screenX : aW.changedTouches[T].screenX,
					screenY : aW.changedTouches[T].screenY,
					pageX : aW.changedTouches[T].pageX,
					pageY : aW.changedTouches[T].pageY,
					target : aW.changedTouches[T].target,
					identifier : aW.changedTouches[T].identifier
				})
			}
		}
		if (aW.targetTouches) {
			aV.targetTouches = [];
			for (var T = 0; T < aW.targetTouches.length; T++) {
				aV.targetTouches.push({
					clientX : aW.targetTouches[T].clientX,
					clientY : aW.targetTouches[T].clientY,
					screenX : aW.targetTouches[T].screenX,
					screenY : aW.targetTouches[T].screenY,
					pageX : aW.targetTouches[T].pageX,
					pageY : aW.targetTouches[T].pageY,
					target : aW.targetTouches[T].target,
					identifier : aW.targetTouches[T].identifier
				})
			}
		}
		aV.rotation = aW.rotation;
		aV.scale = aW.scale;
		return aV
	};
	aK.lang.decontrol = function(aV) {
		var T = window[aK.guid];
		T._instances && (
		delete T._instances[aV])
	};
	aK.event = {};
	aK.on = aK.event.on = function(aW, aV, T) {
		if (!( aW = aK.g(aW))) {
			return aW
		}
		aV = aV.replace(/^on/, "");
		if (aW.addEventListener) {
			aW.addEventListener(aV, T, false)
		} else {
			if (aW.attachEvent) {
				aW.attachEvent("on" + aV, T)
			}
		}
		return aW
	};
	aK.un = aK.event.un = function(aW, aV, T) {
		if (!( aW = aK.g(aW))) {
			return aW
		}
		aV = aV.replace(/^on/, "");
		if (aW.removeEventListener) {
			aW.removeEventListener(aV, T, false)
		} else {
			if (aW.detachEvent) {
				aW.detachEvent("on" + aV, T)
			}
		}
		return aW
	};
	aK.dom.hasClass = function(aW, aV) {
		if (!aW || !aW.className || typeof aW.className != "string") {
			return false
		}
		var T = -1;
		try {
			T = aW.className == aV || aW.className.indexOf(aV)
		} catch(aX) {
			return false
		}
		return T > -1
	};
	window.BMap = window.BMap || {};
	window.BMap._register = [];
	window.BMap.register = function(T) {
		this._register.push(T)
	};
	BMap._streetViewRegister = [];
	BMap.streetViewRegister = function(T) {
		this._streetViewRegister.push(T)
	};
	function z(aX, aZ) {
		aX = aK.g(aX);
		if (!aX) {
			return
		}
		var aY = this;
		aK.lang.Class.call(aY);
		aY.config = {
			clickInterval : 200,
			enableDragging : true,
			enableDblclickZoom : true,
			enableMouseDown : true,
			enablePinchToZoom : true,
			enableAutoResize : true,
			fps : 25,
			actionDuration : 450,
			minZoom : 3,
			maxZoom : 18,
			mapType : new aO("地图", aE, {
				tips : "显示普通地图",
				mapInstance : this
			}),
			enableInertialDragging : false,
			drawer : BMAP_SYS_DRAWER,
			drawMargin : 100,
			enableHighResolution : false,
			devicePixelRatio : window.devicePixelRatio || 2,
			vectorMapLevel : 3,
			fixCenterWhenPinch : false,
			fixCenterWhenResize : false,
			trafficStatus : false
		};
		aK.extend(aY.config, aZ || {});
		if (aY.config.devicePixelRatio > 2) {
			aY.config.devicePixelRatio = 2
		}
		aY.container = aX;
		aY._setStyle(aX);
		aX.unselectable = "on";
		aX.innerHTML = "";
		aX.appendChild(aY.render());
		var aV = aY.getSize();
		aY.width = aV.width;
		aY.height = aV.height;
		aY.offsetX = 0;
		aY.offsetY = 0;
		aY.platform = aX.firstChild;
		aY.preWebkitTransform = "";
		aY.maskLayer = aY.platform.firstChild;
		aY.maskLayer.style.width = aY.width + "px";
		aY.maskLayer.style.height = aY.height + "px";
		aY._panes = {};
		aY.centerPoint = new f(0, 0);
		aY.mercatorCenter = new f(0, 0);
		aY.zoomLevel = 1;
		aY.lastLevel = 0;
		aY.defaultZoomLevel = null;
		aY.defaultCenter = null;
		aY._hotspots = {};
		aY.currentOperation = 0;
		aZ = aZ || {};
		var a0 = aY.mapType = aY.config.mapType;
		aY.projection = a0.getProjection();
		var T = aY.config;
		T.userMinZoom = aZ.minZoom;
		T.userMaxZoom = aZ.maxZoom;
		aY._checkZoom();
		aY.temp = {
			operating : false,
			arrow : 0,
			lastDomMoveTime : 0,
			lastLoadTileTime : 0,
			lastMovingTime : 0,
			canKeyboard : false,
			registerIndex : -1,
			curSpots : []
		};
		for (var aW = 0; aW < BMap._register.length; aW++) {
			BMap._register[aW](aY)
		}
		aY.temp.registerIndex = aW;
		aY._bind();
		ar.load("map", function() {
			aY._draw()
		});
		ar.load("opmb", function() {
			aY._asyncRegister()
		});
		aX = null;
		aY.enableLoadTiles = true;
		aY._viewTiles = []
	}
	aK.lang.inherits(z, aK.lang.Class, "Map");
	aK.extend(z.prototype, {
		render : function() {
			var T = r("div");
			var aX = T.style;
			aX.overflow = "visible";
			aX.position = "absolute";
			aX.zIndex = "0";
			aX.top = aX.left = "0px";
			var aV = r("div", {
				"class" : "BMap_mask"
			});
			var aW = aV.style;
			aW.position = "absolute";
			aW.top = aW.left = "0px";
			aW.zIndex = "9";
			aW.overflow = "hidden";
			aW.WebkitUserSelect = "none";
			T.appendChild(aV);
			return T
		},
		_setStyle : function(aV) {
			var T = aV.style;
			T.overflow = "hidden";
			if (ap(aV).position != "absolute") {
				T.position = "relative";
				T.zIndex = 0
			}
			T.backgroundColor = "#F5F3F0";
			T.color = "#000";
			T.textAlign = "left"
		},
		_bind : function() {
			var T = this;
			T._watchSize = function() {
				var aV = T.getSize();
				if (T.width != aV.width || T.height != aV.height) {
					var aY = new X(T.width, T.height);
					var aZ = new ay("onbeforeresize");
					aZ.size = aY;
					T.dispatchEvent(aZ);
					if (!T.config.fixCenterWhenResize) {
						T._updateCenterPoint((aV.width - T.width) / 2, (aV.height - T.height) / 2)
					}
					T.maskLayer.style.width = (T.width = aV.width) + "px";
					T.maskLayer.style.height = (T.height = aV.height) + "px";
					var aW = new ay("onresize");
					aW.size = aV;
					T.dispatchEvent(aW)
				}
				var aX = T.platform.style.WebkitTransform;
				if (T.preWebkitTransform != "") {
					if (T.preWebkitTransform == aX) {
						aX = T.platform.style.WebkitTransform = ""
					}
				}
				T.preWebkitTransform = aX
			};
			if (T.config.enableAutoResize) {
				T.temp.autoResizeTimer = setInterval(T._watchSize, 1000)
			}
		},
		_updateCenterPoint : function(aZ, a0, aY, aX) {
			var aW = this.getMapType().getZoomUnits(this.getZoom());
			var aV = true;
			if (aY) {
				this.centerPoint = new f(aY.lng, aY.lat);
				aV = false
			}
			var T = (aY && aX) ? aY : this.mercatorCenter;
			if (T) {
				this.mercatorCenter = new f(T.lng + aZ * aW, T.lat - a0 * aW);
				if (this.mercatorCenter && aV) {
					this.centerPoint = this.mercatorCenter
				}
			}
		},
		zoomTo : function(aX, aV) {
			if (!K(aX)) {
				return
			}
			aX = this._getProperZoom(aX).zoom;
			if (aX == this.zoomLevel) {
				return
			}
			this.lastLevel = this.zoomLevel;
			this.zoomLevel = aX;
			var aW;
			if (aV) {
				aW = aV
			}
			if (aW) {
				var T = this.pointToPixel(aW, this.lastLevel);
				this._updateCenterPoint(this.width / 2 - T.x, this.height / 2 - T.y, aW, true)
			}
			this.dispatchEvent(new ay("onzoomstart"));
			this.dispatchEvent(new ay("onzoomstartcode"))
		},
		setZoom : function(T) {
			this.zoomTo(T)
		},
		zoomIn : function(T) {
			this.zoomTo(this.zoomLevel + 1, T)
		},
		zoomOut : function(T) {
			this.zoomTo(this.zoomLevel - 1, T)
		},
		panTo : function(T, aV) {
			if (!( T instanceof f)) {
				return
			}
			this.mercatorCenter = T;
			if (T) {
				this.centerPoint = new f(T.lng, T.lat)
			} else {
				this.centerPoint = this.mercatorCenter
			}
		},
		panBy : function(aV, T) {
			aV = Math.round(aV) || 0;
			T = Math.round(T) || 0;
			this._updateCenterPoint(-aV, -T)
		},
		addControl : function(T) {
			if (T && ax(T._i)) {
				T._i(this);
				this.dispatchEvent(new ay("onaddcontrol", T))
			}
		},
		removeControl : function(T) {
			if (T && ax(T.remove)) {
				T.remove();
				this.dispatchEvent(new ay("onremovecontrol", T))
			}
		},
		addOverlay : function(T) {
			if (T && ax(T._i)) {
				T._i(this);
				this.dispatchEvent(new ay("onaddoverlay", T))
			}
		},
		removeOverlay : function(T) {
			if (T && ax(T.remove)) {
				T.remove();
				this.dispatchEvent(new ay("onremoveoverlay", T))
			}
		},
		clearOverlays : function() {
			this.dispatchEvent(new ay("onclearoverlays"))
		},
		addTileLayer : function(T) {
			if (T) {
				this.dispatchEvent(new ay("onaddtilelayer", T))
			}
		},
		removeTileLayer : function(T) {
			if (T) {
				this.dispatchEvent(new ay("onremovetilelayer", T))
			}
		},
		setCenter : function(T) {
			if (T.equals(this.centerPoint)) {
				return
			}
			this.panTo(T, {
				noAnimation : true
			})
		},
		centerAndZoom : function(T, a2) {
			var aY = this;
			if (!( T instanceof f) || !a2) {
				return
			}
			a2 = aY._getProperZoom(a2).zoom;
			if (T.equals(aY.getCenter()) && a2 === aY.getZoom()) {
				return
			}
			aY.lastLevel = aY.zoomLevel || a2;
			aY.zoomLevel = a2;
			var a0 = aY.centerPoint;
			aY.centerPoint = new f(T.lng, T.lat);
			aY.mercatorCenter = aY.centerPoint;
			aY.defaultZoomLevel = aY.defaultZoomLevel || aY.zoomLevel;
			aY.defaultCenter = aY.defaultCenter || aY.centerPoint;
			var aX = new ay("onload");
			var aW = new ay("onloadcode");
			aX.point = new f(T.lng, T.lat);
			aX.pixel = aY.pointToPixel(aY.centerPoint, aY.zoomLevel);
			aX.zoom = a2;
			if (!aY.loaded) {
				aY.loaded = true;
				aY.dispatchEvent(aX)
			}
			aY.dispatchEvent(aW);
			var a1 = new ay("onmoveend");
			a1._eventSrc = "centerAndZoom";
			if (!a0.equals(aY.centerPoint)) {
				aY.dispatchEvent(a1)
			}
			if (aY.lastLevel != aY.zoomLevel) {
				var aZ = new ay("onzoomend");
				aZ._eventSrc = "centerAndZoom";
				aY.dispatchEvent(aZ)
			}
			var aV = new ay("centerandzoom");
			aY.dispatchEvent(aV)
		},
		reset : function() {
			this.centerAndZoom(this.defaultCenter, this.defaultZoomLevel, true)
		},
		enableDragging : function() {
			this.config.enableDragging = true
		},
		disableDragging : function() {
			this.config.enableDragging = false
		},
		enableInertialDragging : function() {
			this.config.enableInertialDragging = true
		},
		disableInertialDragging : function() {
			this.config.enableInertialDragging = false
		},
		enableDoubleClickZoom : function() {
			this.config.enableDblclickZoom = true
		},
		disableDoubleClickZoom : function() {
			this.config.enableDblclickZoom = false
		},
		enablePinchToZoom : function() {
			this.config.enablePinchToZoom = true
		},
		disablePinchToZoom : function() {
			this.config.enablePinchToZoom = false
		},
		enableAutoResize : function() {
			this.config.enableAutoResize = true;
			this._watchSize();
			if (!this.temp.autoResizeTimer) {
				this.temp.autoResizeTimer = setInterval(this._watchSize, 1000)
			}
		},
		disableAutoResize : function() {
			this.config.enableAutoResize = false;
			if (this.temp.autoResizeTimer) {
				clearInterval(this.temp.autoResizeTimer);
				this.temp.autoResizeTimer = null
			}
		},
		getSize : function() {
			return new X(this.container.clientWidth, this.container.clientHeight)
		},
		getCenter : function() {
			return this.centerPoint
		},
		getZoom : function() {
			return this.zoomLevel
		},
		checkResize : function() {
			this._watchSize()
		},
		_getProperZoom : function(aW) {
			var aV = this.config.minZoom, T = this.config.maxZoom, aX = false;
			if (aW < aV) {
				aX = true;
				aW = aV
			}
			if (aW > T) {
				aX = true;
				aW = T
			}
			return {
				zoom : aW,
				exceeded : aX
			}
		},
		getContainer : function() {
			return this.container
		},
		pointToPixel : function(T, aV) {
			aV = aV || this.getZoom();
			return this.projection.pointToPixel(T, aV, this.mercatorCenter, this.getSize())
		},
		pixelToPoint : function(T, aV) {
			aV = aV || this.getZoom();
			return this.projection.pixelToPoint(T, aV, this.mercatorCenter, this.getSize())
		},
		pointToOverlayPixel : function(T, aW) {
			if (!T) {
				return
			}
			var aX = new f(T.lng, T.lat);
			var aV = this.pointToPixel(aX, aW);
			aV.x -= this.offsetX;
			aV.y -= this.offsetY;
			return aV
		},
		overlayPixelToPoint : function(T, aW) {
			if (!T) {
				return
			}
			var aV = new aP(T.x, T.y);
			aV.x += this.offsetX;
			aV.y += this.offsetY;
			return this.pixelToPoint(aV, aW)
		},
		getBounds : function() {
			if (!this.isLoaded()) {
				return new u()
			}
			var aY = this.getSize();
			this.width = aY.width;
			this.height = aY.height;
			var aV = arguments[0] || {}, aX = aV.margins || [0, 0, 0, 0], T = aV.zoom || null, aZ = this.pixelToPoint({
				x : aX[3],
				y : this.height - aX[2]
			}, T), aW = this.pixelToPoint({
				x : this.width - aX[1],
				y : aX[0]
			}, T);
			return new u(aZ, aW)
		},
		isLoaded : function() {
			return !!this.loaded
		},
		_getBestLevel : function(aV, aW) {
			var aZ = this.getMapType();
			var a1 = aW.margins || [10, 10, 10, 10], aY = aW.zoomFactor || 0, a2 = a1[1] + a1[3], a0 = a1[0] + a1[2], T = aZ.getMinZoom(), a4 = aZ.getMaxZoom();
			for (var aX = a4; aX >= T; aX--) {
				var a3 = this.getMapType().getZoomUnits(aX);
				if (aV.toSpan().lng / a3 < this.width - a2 && aV.toSpan().lat / a3 < this.height - a0) {
					break
				}
			}
			aX += aY;
			if (aX < T) {
				aX = T
			}
			if (aX > a4) {
				aX = a4
			}
			return aX
		},
		getViewport : function(a3, aV) {
			var a7 = {
				center : this.getCenter(),
				zoom : this.getZoom()
			};
			if (!a3 || !a3 instanceof u && a3.length == 0 || a3 instanceof u && a3.isEmpty()) {
				return a7
			}
			var a5 = [];
			if ( a3 instanceof u) {
				a5.push(a3.getNorthEast());
				a5.push(a3.getSouthWest())
			} else {
				a5 = a3.slice(0)
			}
			aV = aV || {};
			var aZ = [];
			for (var a0 = 0, aY = a5.length; a0 < aY; a0++) {
				aZ.push(a5[a0])
			}
			var aW = new u();
			for (var a0 = aZ.length - 1; a0 >= 0; a0--) {
				aW.extend(aZ[a0])
			}
			if (aW.isEmpty()) {
				return a7
			}
			var T = aW.getCenter();
			var a6 = this._getBestLevel(aW, aV);
			if (aV.margins) {
				var a2 = aV.margins, a1 = (a2[1] - a2[3]) / 2, a4 = (a2[0] - a2[2]) / 2, aX = this.getMapType().getZoomUnits(a6);
				T.lng = T.lng + aX * a1;
				T.lat = T.lat + aX * a4
			}
			return {
				center : T,
				zoom : a6
			}
		},
		setViewport : function(aV, aY) {
			var T;
			if (aV && aV.center) {
				T = aV
			} else {
				T = this.getViewport(aV, aY)
			}
			aY = aY || {};
			var aW = aY.delay || 200;
			if (T.zoom == this.zoomLevel && aY.enableAnimation != false) {
				var aX = this;
				setTimeout(function() {
					aX.panTo(T.center, {
						duration : 210
					})
				}, aW)
			} else {
				this.centerAndZoom(T.center, T.zoom)
			}
		},
		getPanes : function() {
			return this._panes
		},
		getOverlays : function() {
			var aX = [], aY = this._overlays, aW = this._customOverlays;
			if (aY) {
				for (var aV in aY) {
					if (aY[aV] instanceof aG) {
						aX.push(aY[aV])
					}
				}
			}
			if (aW) {
				for (var aV = 0, T = aW.length; aV < T; aV++) {
					aX.push(aW[aV])
				}
			}
			return aX
		},
		getMapType : function() {
			return this.mapType
		},
		_asyncRegister : function() {
			for (var T = this.temp.registerIndex; T < BMap._register.length; T++) {
				BMap._register[T](this)
			}
			this.temp.registerIndex = T
		},
		highResolutionEnabled : function() {
			return this.config.enableHighResolution && window.devicePixelRatio > 1
		},
		enableHighResolution : function() {
			this.config.enableHighResolution = true
		},
		disableHighResolution : function() {
			this.config.enableHighResolution = false
		},
		addHotspot : function(aV) {
			if ( aV instanceof L) {
				this._hotspots[aV.guid] = aV;
				aV.initialize(this)
			}
			var T = this;
			ar.load("hotspot", function() {
				T._asyncRegister()
			})
		},
		removeHotspot : function(T) {
			if (this._hotspots[T.guid]) {
				delete this._hotspots[T.guid]
			}
		},
		clearHotspots : function() {
			this._hotspots = {}
		},
		_checkZoom : function() {
			var aV = this.mapType.getMinZoom();
			var aW = this.mapType.getMaxZoom();
			var T = this.config;
			T.minZoom = T.userMinZoom || aV;
			T.maxZoom = T.userMaxZoom || aW;
			if (T.minZoom < aV) {
				T.minZoom = aV
			}
			if (T.maxZoom > aW) {
				T.maxZoom = aW
			}
		},
		setMinZoom : function(T) {
			if (T > this.config.maxZoom) {
				T = this.config.maxZoom
			}
			this.config.userMinZoom = T;
			this._updateZoom()
		},
		setMaxZoom : function(T) {
			if (T < this.config.minZoom) {
				T = this.config.minZoom
			}
			this.config.userMaxZoom = T;
			this._updateZoom()
		},
		_updateZoom : function() {
			this._checkZoom();
			var T = this.config;
			if (this.zoomLevel < T.minZoom) {
				this.setZoom(T.minZoom)
			} else {
				if (this.zoomLevel > T.maxZoom) {
					this.setZoom(T.maxZoom)
				}
			}
			var aV = new ay("onzoomspanchange");
			aV.minZoom = T.minZoom;
			aV.maxZoom = T.maxZoom;
			this.dispatchEvent(aV)
		},
		getViewTiles : function() {
			return this._viewTiles
		},
		vectorMapEnabled : function() {
			return this.config.vectorMapLevel != 99
		},
		setTrafficOn : function() {
			this.config.trafficStatus = true;
			this.tileMgr.setRasterTrafficStatus();
			this.tileMgr.setVectorTrafficStatus()
		},
		setTrafficOff : function() {
			this.config.trafficStatus = false;
			this.tileMgr.setRasterTrafficStatus();
			this.tileMgr.setVectorTrafficStatus()
		},
		showOverlayContainer : function() {
			if (this.overlayDiv) {
				this.overlayDiv.style.visibility = ""
			}
		},
		hideOverlayContainer : function() {
			if (this.overlayDiv) {
				this.overlayDiv.style.visibility = "hidden"
			}
		}
	});
	window.BMAP_SYS_DRAWER = 0;
	window.BMAP_SVG_DRAWER = 1;
	window.BMAP_CANVAS_DRAWER = 3;
	(function() {
		window.asyncMdlVer = {
			control : "kjxkph",
			hotspot : "ur1vb5",
			map : "flwz1b",
			marker : "yyz1tt",
			opmb : "uddwgi",
			poly : "btdsoc",
			vector : "jmdnwe",
			streetview : "uvpdao",
			layer : "azr2hf"
		};
		window.chkVersion = function(T) {
			try {
				var aV = window.localStorage;
				if (!aV) {
					return false
				}
				return aV[T] && aV[T].length > 0
			} catch(aW) {
				return false
			}
		};
		window.saveVersion = function(T, a0, aY) {
			try {
				var aW = window.localStorage;
				if (aW) {
					for (var aV = aW.length, aX = aV - 1; aX >= 0; aX--) {
						var a1 = aW.key(aX);
						if (a1.indexOf(aY) > -1) {
							aW.removeItem(a1)
						}
					}
					aW.setItem(T, a0)
				}
			} catch(aZ) {
			}
		};
		window.getVersion = function(T) {
			try {
				var aV = window.localStorage;
				if (!aV) {
					return ""
				}
				return aV.getItem(T)
			} catch(aW) {
				return ""
			}
		}
	})();
	function aL(aX) {
		var T = {
			duration : 1000,
			fps : 30,
			delay : 0,
			transition : h.linear,
			onStop : function() {
			}
		};
		this._anis = [];
		if (aX) {
			for (var aV in aX) {
				T[aV] = aX[aV]
			}
		}
		this._opts = T;
		if (K(T.delay)) {
			var aW = this;
			setTimeout(function() {
				aW.start()
			}, T.delay)
		} else {
			if (T.delay != aL.INFINITE) {
				this.start()
			}
		}
	}
	aL.INFINITE = "INFINITE";
	aL.prototype.start = function() {
		this._beginTime = y();
		this._endTime = this._beginTime + this._opts.duration;
		this._launch()
	};
	aL.prototype.add = function(T) {
		this._anis.push(T)
	};
	aL.prototype._launch = function() {
		var aW = this;
		var T = y();
		if (T >= aW._endTime) {
			if (ax(aW._opts.render)) {
				aW._opts.render(aW._opts.transition(1))
			}
			if (ax(aW._opts.finish)) {
				aW._opts.finish()
			}
			if (aW._anis.length > 0) {
				var aV = aW._anis[0];
				aV._anis = [].concat(aW._anis.slice(1));
				aV.start()
			}
			return
		}
		aW.schedule = aW._opts.transition((T - aW._beginTime) / aW._opts.duration);
		if (ax(aW._opts.render)) {
			aW._opts.render(aW.schedule)
		}
		if (!aW.terminative) {
			aW._timer = setTimeout(function() {
				aW._launch()
			}, 1000 / aW._opts.fps)
		}
	};
	aL.prototype.stop = function(aV) {
		this.terminative = true;
		for (var T = 0; T < this._anis.length; T++) {
			this._anis[T].stop();
			this._anis[T] = null
		}
		this._anis.length = 0;
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null
		}
		this._opts.onStop(this.schedule);
		if (aV) {
			this._endTime = this._beginTime;
			this._launch()
		}
	};
	aL.prototype.cancel = function() {
		if (this._timer) {
			clearTimeout(this._timer)
		}
		this._endTime = this._beginTime;
		this.schedule = 0
	};
	aL.prototype.setFinishCallback = function(T) {
		if (this._anis.length > 0) {
			this._anis[this._anis.length - 1]._opts.finish = T
		} else {
			this._opts.finish = T
		}
	};
	var h = {
		linear : function(T) {
			return T
		},
		reverse : function(T) {
			return 1 - T
		},
		easeInQuad : function(T) {
			return T * T
		},
		easeInCubic : function(T) {
			return Math.pow(T, 3)
		},
		easeOutQuad : function(T) {
			return -(T * (T - 2))
		},
		easeOutCubic : function(T) {
			return Math.pow((T - 1), 3) + 1
		},
		easeInOutQuad : function(T) {
			if (T < 0.5) {
				return T * T * 2
			} else {
				return -2 * (T - 2) * T - 1
			}
			return
		},
		easeInOutCubic : function(T) {
			if (T < 0.5) {
				return Math.pow(T, 3) * 4
			} else {
				return Math.pow(T - 1, 3) * 4 + 1
			}
		},
		easeInOutSine : function(T) {
			return (1 - Math.cos(Math.PI * T)) / 2
		}
	};
	h["ease-in"] = h.easeInQuad;
	h["ease-out"] = h.easeOutQuad;
	var aT = {
		imgPath : "http://map.baidu.com/res_mobile2/images/"
	};
	function aU(aW, T) {
		var aV = aW.style;
		aV.left = T[0] + "px";
		aV.top = T[1] + "px"
	}

	function n(T) {
		T.style.MozUserSelect = "none"
	}

	function q(T) {
		return T && T.parentNode && T.parentNode.nodeType != 11
	}

	function Y(aV, T) {
		aK.dom.insertHTML(aV, "beforeEnd", T);
		return aV.lastChild
	}

	function x(T) {
		var aV = {
			left : 0,
			top : 0
		};
		while (T && T.offsetParent) {
			aV.left += T.offsetLeft;
			aV.top += T.offsetTop;
			T = T.offsetParent
		}
		return aV
	}

	function ag(T) {
		var T = window.event || T;
		T.stopPropagation ? T.stopPropagation() : T.cancelBubble = true
	}

	function A(T) {
		var T = window.event || T;
		T.preventDefault ? T.preventDefault() : T.returnValue = false;
		return false
	}

	function aB(T) {
		ag(T);
		return A(T)
	}

	function I() {
		var T = document.documentElement, aV = document.body;
		if (T && (T.scrollTop || T.scrollLeft)) {
			return [T.scrollTop, T.scrollLeft]
		} else {
			if (aV) {
				return [aV.scrollTop, aV.scrollLeft]
			} else {
				return [0, 0]
			}
		}
	}

	function s(aV, T) {
		if (!aV || !T) {
			return
		}
		return Math.round(Math.sqrt(Math.pow(aV.x - T.x, 2) + Math.pow(aV.y - T.y, 2)))
	}

	function r(aV, T, aW) {
		var aX = document.createElement(aV);
		if (aW) {
			aX = document.createElementNS(aW, aV)
		}
		return aK.dom.setAttrs(aX, T || {})
	}

	function ap(T) {
		if (T.currentStyle) {
			return T.currentStyle
		} else {
			if (T.ownerDocument && T.ownerDocument.defaultView) {
				return T.ownerDocument.defaultView.getComputedStyle(T, null)
			}
		}
	}

	function ax(T) {
		return typeof T == "function"
	}

	function K(T) {
		return typeof T == "number"
	}

	function aI(T) {
		return typeof T == "string"
	}

	function ah(T) {
		return typeof T != "undefined"
	}

	function D(T) {
		return typeof T == "object"
	}

	function d(T) {
		return "[object Array]" == Object.prototype.toString.call(T)
	}

	function j() {
		if ( typeof j.result != "boolean") {
			j.result = !!document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Shape", "1.1")
		}
		return j.result
	}

	function Z() {
		if ( typeof Z.result != "boolean") {
			Z.result = !!r("canvas").getContext
		}
		return Z.result
	}

	function aq(T) {
		return T * Math.PI / 180
	}

	var ay = aK.lang.Event;
	function au() {
		return !!(aK.platform.isIphone || aK.platform.isIpad || aK.platform.isAndroid)
	}

	function y() {
		return (new Date).getTime()
	}

	function g() {
		if (aK.platform.isAndroid && parseFloat(aK.platform.android) > 2.3) {
			return true
		}
		return false
	}

	var aN = {
		request : function(aV) {
			var T = r("script", {
				src : aV,
				type : "text/javascript",
				charset : "utf-8"
			});
			T.addEventListener("load", function(aX) {
				var aW = aX.target;
				aW.parentNode.removeChild(aW)
			}, false);
			document.getElementsByTagName("head")[0].appendChild(T);
			T = null
		}
	};
	window.sendReqNo = 0;
	function ar() {
	}
	aK.object.extend(ar, {
		Request : {
			INITIAL : -1,
			WAITING : 0,
			COMPLETED : 1
		},
		getDependency : function() {
			return {
				poly : ["marker"],
				layer : ["vector"]
			}
		},
		Config : {
			_baseUrl : "http://map.baidu.com/mobile/?qt=getMobileModules&v=2&"
		},
		delayFlag : false,
		ModuleTree : {
			_modules : {},
			_arrMdls : []
		},
		load : function(aW, aY, aV) {
			var T = this.getModule(aW);
			if (T._status == this.Request.COMPLETED) {
				if (aV) {
					aY()
				}
				return
			} else {
				if (T._status == this.Request.INITIAL) {
					this.combine(aW);
					this.pushUniqueMdl(aW);
					var aX = this;
					if (aX.delayFlag == false) {
						aX.delayFlag = true;
						window.setTimeout(function() {
							var a5 = aX.ModuleTree._arrMdls.slice(0);
							var a7 = [];
							for (var a1 = 0, a0 = a5.length; a1 < a0; a1++) {
								var a6 = a5[a1], aZ = window.asyncMdlVer[a6], a3 = "async_" + a6 + "_" + aZ;
								if (!window.chkVersion(a3)) {
									a5[a5[a1]] = "";
									a7.push(a6 + "_" + aZ)
								} else {
									a5[a5[a1]] = window.getVersion(a3)
								}
							}
							if (a7.length == 0) {
								for (var a1 = 0, a0 = a5.length; a1 < a0; a1++) {
									var a8 = a5[a1], a3 = "async_" + a8 + "_" + window.asyncMdlVer[a8], a4 = window.getVersion(a3);
									ar.run(a8, a4)
								}
							} else {
								var a2 = aX.Config._baseUrl + "mod=" + a7.join(",") + "&sendReqNo=" + window.sendReqNo + "&cbk=_jsload";
								aN.request(a2);
								window["sendReqNo" + window.sendReqNo] = a5;
								window.sendReqNo++
							}
							aX.delayFlag = false;
							aX.ModuleTree._arrMdls.length = 0
						}, 1)
					}
					T._status = this.Request.WAITING
				}
				T._callbacks.push(aY)
			}
		},
		combine : function(T) {
			var aW = this.getDependency();
			if (T && aW[T]) {
				var aW = aW[T];
				for (var aV = 0; aV < aW.length; aV++) {
					this.combine(aW[aV]);
					if (!this.ModuleTree._modules[aW[aV]]) {
						this.pushUniqueMdl(aW[aV])
					}
				}
			}
		},
		pushUniqueMdl : function(aX) {
			var T = this.ModuleTree._arrMdls;
			for (var aW = 0, aV = T.length; aW < aV; aW++) {
				if (T[aW] == aX) {
					return
				}
			}
			T.push(aX)
		},
		getModule : function(aV) {
			var T;
			if (!this.ModuleTree._modules[aV]) {
				this.ModuleTree._modules[aV] = {};
				this.ModuleTree._modules[aV]._status = this.Request.INITIAL;
				this.ModuleTree._modules[aV]._callbacks = []
			}
			T = this.ModuleTree._modules[aV];
			return T
		},
		run : function(aX, a0) {
			var aV = "async_" + aX + "_" + window.asyncMdlVer[aX], aZ = "async_" + aX;
			if (!window.chkVersion(aV)) {
				window.saveVersion(aV, a0, aZ)
			}
			var aW = this.getModule(aX);
			try {
				eval(a0)
			} catch(a1) {
				return
			}
			aW._status = this.Request.COMPLETED;
			for (var aY = 0, T = aW._callbacks.length; aY < T; aY++) {
				aW._callbacks[aY]()
			}
			aW._callbacks.length = 0
		}
	});
	window._jsload = function(aZ, a1, a0) {
		var T = window["sendReqNo" + a0], aW = aZ.split("_")[0];
		T[aW] = a1;
		var aY = true;
		for (var aX = 0, aV = T.length; aX < aV; aX++) {
			if (T[T[aX]].length <= 0) {
				aY = false;
				break
			}
		}
		if (aY) {
			for (var aX = 0, aV = T.length; aX < aV; aX++) {
				var aZ = T[aX], a1 = T[aZ];
				ar.run(aZ, a1)
			}
			T.length = 0;
			delete window["sendReqNo" + a0]
		}
	};
	function aP(T, aV) {
		this.x = T || 0;
		this.y = aV || 0
	}
	aP.prototype.equals = function(T) {
		return T && T.x == this.x && T.y == this.y
	};
	function X(aV, T) {
		this.width = aV || 0;
		this.height = T || 0
	}
	X.prototype.equals = function(T) {
		return T && this.width == T.width && this.height == T.height
	};
	function L(T, aV) {
		if (!T) {
			return
		}
		this._position = T;
		this.guid = "spot" + (L.guid++);
		aV = aV || {};
		this._text = aV.text || "";
		this._offsets = aV.offsets ? aV.offsets.slice(0) : [5, 5, 5, 5];
		this._userData = aV.userData || null;
		this._minZoom = aV.minZoom || null;
		this._maxZoom = aV.maxZoom || null
	}
	L.guid = 0;
	aK.extend(L.prototype, {
		initialize : function(T) {
			if (this._minZoom == null) {
				this._minZoom = T.config.minZoom
			}
			if (this._maxZoom == null) {
				this._maxZoom = T.config.maxZoom
			}
		},
		setPosition : function(T) {
			if ( T instanceof f) {
				this._position = T
			}
		},
		getPosition : function() {
			return this._position
		},
		setText : function(T) {
			this._text = T
		},
		getText : function() {
			return this._text
		},
		setUserData : function(T) {
			this._userData = T
		},
		getUserData : function() {
			return this._userData
		}
	});
	function O() {
		this._map = null;
		this._container
		this._type = "control";
		this._visible = true
	}
	aK.lang.inherits(O, aK.lang.Class, "Control");
	aK.extend(O.prototype, {
		initialize : function(T) {
			this._map = T;
			if (this._container) {
				T.container.appendChild(this._container);
				return this._container
			}
			return
		},
		_i : function(T) {
			if (!this._container && this.initialize && ax(this.initialize)) {
				this._container = this.initialize(T)
			}
			this._opts = this._opts || {
				printable : false
			};
			this._setStyle();
			this._setPosition();
			if (this._container) {
				this._container._jsobj = this
			}
		},
		_setStyle : function() {
			var aV = this._container;
			if (aV) {
				var T = aV.style;
				T.position = "absolute";
				T.zIndex = this._container.style.zIndex || "10";
				T.MozUserSelect = "none";
				T.WebkitTextSizeAdjust = "none";
				if (!this._opts.printable) {
					aK.dom.addClass(aV, "BMap_noprint")
				}
			}
		},
		remove : function() {
			this._map = null;
			if (!this._container) {
				return
			}
			this._container.parentNode && this._container.parentNode.removeChild(this._container);
			this._container._jsobj = null;
			this._container = null
		},
		_render : function() {
			this._container = Y(this._map.container, "<div unselectable='on'></div>");
			if (this._visible == false) {
				aK.dom.hide(this._container)
			}
			return this._container
		},
		_setPosition : function() {
			this.setAnchor(this._opts.anchor)
		},
		setAnchor : function(aX) {
			if (this.anchorFixed || !K(aX) || isNaN(aX) || aX < BMAP_ANCHOR_TOP_LEFT || aX > BMAP_ANCHOR_BOTTOM_RIGHT) {
				aX = this.defaultAnchor
			}
			this._opts = this._opts || {
				printable : false
			};
			this._opts.offset = this._opts.offset || this.defaultOffset;
			var aW = this._opts.anchor;
			this._opts.anchor = aX;
			if (!this._container) {
				return
			}
			var aZ = this._container;
			var T = this._opts.offset.width;
			var aY = this._opts.offset.height;
			if (this instanceof R) {
				if (this._map && this._map.highResolutionEnabled()) {
					aZ.childNodes[1].style.height = "2px";
					aZ.childNodes[2].style.height = "4px";
					aZ.childNodes[3].style.height = "4px";
					aZ.style.height = "19px"
				}
			}
			aZ.firstChild.style.cssText = "font-size:11px;line-height:18px;";
			aZ.style.left = aZ.style.top = aZ.style.right = aZ.style.bottom = "auto";
			switch(aX) {
				case BMAP_ANCHOR_TOP_LEFT:
					aZ.style.top = aY + "px";
					aZ.style.left = T + "px";
					break;
				case BMAP_ANCHOR_TOP_RIGHT:
					aZ.style.top = aY + "px";
					aZ.style.right = T + "px";
					break;
				case BMAP_ANCHOR_BOTTOM_LEFT:
					aZ.style.bottom = aY + "px";
					aZ.style.left = T + "px";
					break;
				case BMAP_ANCHOR_BOTTOM_RIGHT:
					aZ.style.bottom = aY + "px";
					aZ.style.right = T + "px";
					break;
				default:
					break
			}
			var aV = ["TL", "TR", "BL", "BR"];
			aK.dom.removeClass(this._container, "anchor" + aV[aW]);
			aK.dom.addClass(this._container, "anchor" + aV[aX])
		},
		getAnchor : function() {
			return this._opts.anchor
		},
		setOffset : function(T) {
			if (!( T instanceof X)) {
				return
			}
			this._opts = this._opts || {
				printable : false
			};
			this._opts.offset = new X(T.width, T.height);
			if (!this._container) {
				return
			}
			this.setAnchor(this._opts.anchor)
		},
		getOffset : function() {
			return this._opts.offset
		},
		getDom : function() {
			return this._container
		},
		show : function() {
			this._visible = true;
			if (this._container) {
				aK.dom.show(this._container)
			}
		},
		hide : function() {
			this._visible = false;
			if (this._container) {
				aK.dom.hide(this._container)
			}
		},
		isPrintable : function() {
			return !!this._opts.printable
		},
		isVisible : function() {
			if (!this._container && !this._map) {
				return false
			}
			return !!this._visible
		}
	});
	window.BMAP_ANCHOR_TOP_LEFT = 0;
	window.BMAP_ANCHOR_TOP_RIGHT = 1;
	window.BMAP_ANCHOR_BOTTOM_LEFT = 2;
	window.BMAP_ANCHOR_BOTTOM_RIGHT = 3;
	function R(T) {
		O.call(this);
		T = T || {};
		this._opts = {
			printable : false
		};
		this._opts = aK.object.extend(aK.object.extend(this._opts, {
			color : "black",
			unit : "metric"
		}), T);
		this.defaultAnchor = BMAP_ANCHOR_BOTTOM_LEFT;
		this.defaultOffset = new X(81, 18);
		this.setAnchor(T.anchor);
		this._units = {
			metric : {
				name : "metric",
				conv : 1,
				incon : 1000,
				u1 : "米",
				u2 : "公里"
			}
		};
		if (!this._units[this._opts.unit]) {
			this._opts.unit = "metric"
		}
		this._scaleText = null;
		this._numberArray = {};
		this._asyncLoadCode()
	}
	window.BMAP_UNIT_METRIC = "metric";
	aK.lang.inherits(R, O, "ScaleControl");
	aK.object.extend(R.prototype, {
		initialize : function(T) {
			this._map = T;
			return this._container
		},
		setColor : function(T) {
			this._opts.color = T + ""
		},
		getColor : function() {
			return this._opts.color
		},
		_asyncLoadCode : function() {
			var T = this;
			ar.load("control", function() {
				T._asyncDraw()
			})
		}
	});
	function u(T, aV) {
		if (T && !aV) {
			aV = T
		}
		this._sw = this._ne = null;
		this._swLng = this._swLat = null;
		this._neLng = this._neLat = null;
		if (T) {
			this._sw = new f(T.lng, T.lat);
			this._ne = new f(aV.lng, aV.lat);
			this._swLng = T.lng;
			this._swLat = T.lat;
			this._neLng = aV.lng;
			this._neLat = aV.lat
		}
	}
	aK.object.extend(u.prototype, {
		isEmpty : function() {
			return !this._sw || !this._ne
		},
		equals : function(T) {
			if (!( T instanceof u) || this.isEmpty()) {
				return false
			}
			return this.getSouthWest().equals(T.getSouthWest()) && this.getNorthEast().equals(T.getNorthEast())
		},
		getSouthWest : function() {
			return this._sw
		},
		getNorthEast : function() {
			return this._ne
		},
		getCenter : function() {
			if (this.isEmpty()) {
				return null
			}
			return new f((this._swLng + this._neLng) / 2, (this._swLat + this._neLat) / 2)
		},
		extend : function(T) {
			if (!( T instanceof f)) {
				return
			}
			var aV = T.lng, aW = T.lat;
			if (!this._sw) {
				this._sw = new f(0, 0)
			}
			if (!this._ne) {
				this._ne = new f(0, 0)
			}
			if (!this._swLng || this._swLng > aV) {
				this._sw.lng = this._swLng = aV
			}
			if (!this._neLng || this._neLng < aV) {
				this._ne.lng = this._neLng = aV
			}
			if (!this._swLat || this._swLat > aW) {
				this._sw.lat = this._swLat = aW
			}
			if (!this._neLat || this._neLat < aW) {
				this._ne.lat = this._neLat = aW
			}
		},
		toSpan : function() {
			if (this.isEmpty()) {
				return new f(0, 0)
			}
			return new f(Math.abs(this._neLng - this._swLng), Math.abs(this._neLat - this._swLat))
		}
	});
	function f(T, aV) {
		this.lng = parseFloat(T);
		this.lat = parseFloat(aV)
	}
	f.prototype.equals = function(T) {
		return T && this.lat == T.lat && this.lng == T.lng
	};
	function aA(T) {
		this._mapType = T
	}
	aK.extend(aA.prototype, {
		pointToPixel : function(aV, aZ, aY, aX) {
			if (!aV) {
				return
			}
			var aW = this._mapType.getZoomUnits(aZ);
			var T = Math.round((aV.lng - aY.lng) / aW + aX.width / 2);
			var a0 = Math.round((aY.lat - aV.lat) / aW + aX.height / 2);
			return new aP(T, a0)
		},
		pixelToPoint : function(aX, a0, aZ, aY) {
			if (!aX) {
				return
			}
			var aV = this._mapType.getZoomUnits(a0);
			var aW = aZ.lng + aV * (aX.x - aY.width / 2);
			var a1 = aZ.lat - aV * (aX.y - aY.height / 2);
			var T = new f(aW, a1);
			return T
		}
	});
	function N() {
		this._type = "overlay"
	}
	aK.lang.inherits(N, aK.lang.Class, "Overlay");
	N.getZIndex = function(T) {
		T = T * 1;
		if (!T) {
			return 0
		}
		return (T * -100000) << 1
	};
	aK.extend(N.prototype, {
		_i : function(T) {
			if (!this.domElement && ax(this.initialize)) {
				this.domElement = this.initialize(T);
				if (this.domElement) {
					this.domElement.style.WebkitUserSelect = "none"
				}
			}
			this.draw()
		},
		initialize : function(T) {
			throw "initialize方法未实现"
		},
		draw : function() {
			throw "draw方法未实现"
		},
		remove : function() {
			if (this.domElement && this.domElement.parentNode) {
				this.domElement.parentNode.removeChild(this.domElement)
			}
			this.domElement = null;
			this.dispatchEvent(new ay("onremove"))
		},
		hide : function() {
			if (this.domElement) {
				aK.dom.hide(this.domElement)
			}
		},
		show : function() {
			if (this.domElement) {
				aK.dom.show(this.domElement)
			}
		},
		isVisible : function() {
			if (!this.domElement) {
				return false
			}
			if (this.domElement.style.display == "none" || this.domElement.style.visibility == "hidden") {
				return false
			}
			return true
		}
	});
	BMap.register(function(aW) {
		var T = aW.temp;
		T.overlayDiv = aW.overlayDiv = aV(aW.platform, 200);
		aW._panes.floatPane = aV(T.overlayDiv, 800);
		aW._panes.markerMouseTarget = aV(T.overlayDiv, 700);
		aW._panes.floatShadow = aV(T.overlayDiv, 600);
		aW._panes.labelPane = aV(T.overlayDiv, 500);
		aW._panes.markerPane = aV(T.overlayDiv, 400);
		aW._panes.markerShadow = aV(T.overlayDiv, 300);
		aW._panes.mapPane = aV(T.overlayDiv, 200);
		function aV(aX, a0) {
			var aZ = r("div"), aY = aZ.style;
			aY.position = "absolute";
			aY.top = aY.left = aY.width = aY.height = "0";
			aY.zIndex = a0;
			aX.appendChild(aZ);
			return aZ
		}

	});
	function aG() {
		aK.lang.Class.call(this);
		N.call(this);
		this.map = null;
		this._visible = true;
		this._dblclickTime = 0
	}
	aK.lang.inherits(aG, N, "OverlayInternal");
	aK.extend(aG.prototype, {
		initialize : function(T) {
			this.map = T;
			aK.lang.Class.call(this, this.guid);
			return null
		},
		getMap : function() {
			return this.map
		},
		draw : function() {
		},
		remove : function() {
			this.map = null;
			aK.lang.decontrol(this.guid);
			N.prototype.remove.call(this)
		},
		hide : function() {
			if (this._visible == false) {
				return
			}
			this._visible = false
		},
		show : function() {
			if (this._visible == true) {
				return
			}
			this._visible = true
		},
		isVisible : function() {
			if (!this.domElement) {
				return false
			}
			return !!this._visible
		},
		getContainer : function() {
			return this.domElement
		},
		setConfig : function(aV) {
			aV = aV || {};
			for (var T in aV) {
				this._config[T] = aV[T]
			}
		},
		setZIndex : function(T) {
			this.zIndex = T
		},
		enableMassClear : function() {
			this._config.enableMassClear = true
		},
		disableMassClear : function() {
			this._config.enableMassClear = false
		}
	});
	function at() {
		this.map = null;
		this._overlays = {};
		this._customOverlays = []
	}
	BMap.register(function(aV) {
		var T = new at();
		T.map = aV;
		aV._overlays = T._overlays;
		aV._customOverlays = T._customOverlays;
		aV.addEventListener("moveend", function(aW) {
			if (aW._eventSrc != "centerAndZoom") {
				T.draw(aW)
			}
		});
		aV.addEventListener("zoomend", function(aW) {
			if (aW._eventSrc != "centerAndZoom") {
				T.draw(aW)
			}
		});
		aV.addEventListener("centerandzoom", function(aW) {
			T.draw(aW)
		});
		aV.addEventListener("resize", function(aW) {
			T.draw(aW)
		});
		aV.addEventListener("addoverlay", function(a0) {
			var aX = a0.target;
			if ( aX instanceof aG) {
				if (!T._overlays[aX.guid]) {
					T._overlays[aX.guid] = aX
				}
			} else {
				var aZ = false;
				for (var aY = 0, aW = T._customOverlays.length; aY < aW; aY++) {
					if (T._customOverlays[aY] === aX) {
						aZ = true;
						break
					}
				}
				if (!aZ) {
					T._customOverlays.push(aX)
				}
			}
		});
		aV.addEventListener("removeoverlay", function(aZ) {
			var aX = aZ.target;
			if ( aX instanceof aG) {
				delete T._overlays[aX.guid]
			} else {
				for (var aY = 0, aW = T._customOverlays.length; aY < aW; aY++) {
					if (T._customOverlays[aY] === aX) {
						T._customOverlays.splice(aY, 1);
						break
					}
				}
			}
		});
		aV.addEventListener("clearoverlays", function(aZ) {
			for (var aY in T._overlays) {
				if (T._overlays[aY]._config.enableMassClear) {
					T._overlays[aY].remove();
					delete T._overlays[aY]
				}
			}
			for (var aX = 0, aW = T._customOverlays.length; aX < aW; aX++) {
				if (T._customOverlays[aX].enableMassClear != false) {
					T._customOverlays[aX].remove();
					T._customOverlays[aX] = null;
					T._customOverlays.splice(aX, 1);
					aX--;
					aW--
				}
			}
		})
	});
	at.prototype.draw = function(aW) {
		if (BMap.DrawerSelector) {
			var T = BMap.DrawerSelector.getDrawer(this.map);
			T.setPalette()
		}
		for (var aV in this._overlays) {
			this._overlays[aV].draw()
		}
		aK.array.each(this._customOverlays, function(aX) {
			aX.draw()
		})
	};
	function av(T) {
		aG.call(this);
		this._config = {
			strokeColor : "#3a6bdb",
			strokeWeight : 5,
			strokeOpacity : 0.65,
			strokeStyle : "solid",
			enableMassClear : true,
			getParseTolerance : null,
			getParseCacheIndex : null,
			enableParse : true,
			clickable : true
		};
		T = T || {};
		this.setConfig(T);
		if (this._config.strokeWeight <= 0) {
			this._config.strokeWeight = 5
		}
		if (this._config.strokeOpacity < 0 || this._config.strokeOpacity > 1) {
			this._config.strokeOpacity = 0.65
		}
		if (this._config.strokeStyle != "solid" && this._config.strokeStyle != "dashed") {
			this._config.strokeStyle = "solid"
		}
		if (ah(T.enableClicking)) {
			this._config.clickable = T.enableClicking
		}
		this.domElement = null;
		this._bounds = new BMap.Bounds(0, 0, 0, 0);
		this._parseCache = [];
		this._temp = {}
	}
	aK.lang.inherits(av, aG, "Graph");
	av.getGraphPoints = function(aV) {
		var T = [];
		if (!aV) {
			return T
		}
		if (aI(aV)) {
			var aW = aV.split(";");
			aK.array.each(aW, function(aY) {
				var aX = aY.split(",");
				T.push(new f(aX[0], aX[1]))
			})
		}
		if (aV.constructor == Array && aV.length > 0) {
			T = aV
		}
		return T
	};
	av.parseTolerance = [20000, 2000, 200, 20];
	aK.extend(av.prototype, {
		initialize : function(T) {
			this.map = T;
			return null
		},
		draw : function() {
		},
		setPath : function(T) {
			this._parseCache.length = 0;
			this.points = av.getGraphPoints(T).slice(0);
			this._calcBounds()
		},
		_calcBounds : function() {
			if (!this.points) {
				return
			}
			var T = this;
			T._bounds = new u();
			aK.array.each(this.points, function(aV) {
				T._bounds.extend(aV)
			})
		},
		getPath : function() {
			return this.points
		},
		setPositionAt : function(aV, T) {
			if (!T || !this.points[aV]) {
				return
			}
			this._parseCache.length = 0;
			this.points[aV] = new f(T.lng, T.lat);
			this._calcBounds()
		},
		setStrokeColor : function(T) {
			this._config.strokeColor = T
		},
		getStrokeColor : function() {
			return this._config.strokeColor
		},
		setStrokeWeight : function(T) {
			if (T > 0) {
				this._config.strokeWeight = T
			}
		},
		getStrokeWeight : function() {
			return this._config.strokeWeight
		},
		setStrokeOpacity : function(T) {
			if (!T || T > 1 || T < 0) {
				return
			}
			this._config.strokeOpacity = T
		},
		getStrokeOpacity : function() {
			return this._config.strokeOpacity
		},
		setStrokeStyle : function(T) {
			if (T != "solid" && T != "dashed") {
				return
			}
			this._config.strokeStyle = T
		},
		getStrokeStyle : function() {
			return this._config.strokeStyle
		},
		setFillColor : function(T) {
			this._config.fillColor = T || ""
		},
		getBounds : function() {
			return this._bounds
		},
		remove : function() {
			aG.prototype.remove.call(this);
			this._parseCache.length = 0
		}
	});
	function t(aV, aW, aX) {
		if (!aV || !aW) {
			return
		}
		this.imageUrl = aV;
		this.size = aW;
		var T = new X(Math.floor(aW.width / 2), Math.floor(aW.height / 2));
		var aY = {
			anchor : T,
			imageOffset : new X(0, 0)
		};
		aX = aX || {};
		aK.extend(aY, aX);
		this.anchor = aY.anchor;
		this.imageOffset = aY.imageOffset;
		this.printImageUrl = aX.printImageUrl || ""
	}

	var P = t.prototype;
	P.setImageUrl = function(T) {
		if (!T) {
			return
		}
		this.imageUrl = T
	};
	P.setPrintImageUrl = function(T) {
		if (!T) {
			return
		}
		this.printImageUrl = T
	};
	P.setSize = function(T) {
		if (!T) {
			return
		}
		this.size = new X(T.width, T.height)
	};
	P.setAnchor = function(T) {
		if (!T) {
			return
		}
		this.anchor = new X(T.width, T.height)
	};
	P.setImageOffset = function(T) {
		if (!T) {
			return
		}
		this.imageOffset = new X(T.width, T.height)
	};
	P.toString = function() {
		return "Icon"
	};
	var ai = aT.imgPath + "red_marker.png";
	var aH = new t(ai, new X(19, 25), {
		anchor : new X(10, 25)
	});
	var G = new t(ai, new X(20, 11), {
		anchor : new X(6, 11),
		imageOffset : new X(-19, -13)
	});
	function E(T, aW) {
		aG.call(this);
		aW = aW || {};
		this.point = T;
		this.map = null;
		this._config = {
			offset : new X(0, 0),
			icon : aH,
			shadow : G,
			title : "",
			baseZIndex : 0,
			clickable : true,
			zIndexFixed : false,
			isTop : false,
			enableMassClear : true
		};
		this.setConfig(aW);
		if (aW.icon && !aW.shadow) {
			this._config.shadow = null
		}
		if (ah(aW.enableClicking)) {
			this._config.clickable = aW.enableClicking
		}
		var aV = this;
		ar.load("marker", function() {
			aV._draw()
		})
	}
	E.TOP_ZINDEX = N.getZIndex(-90) + 1000000;
	aK.lang.inherits(E, aG, "Marker");
	aK.extend(E.prototype, {
		setIcon : function(T) {
			if ( T instanceof t) {
				this._config.icon = T
			}
		},
		getIcon : function() {
			return this._config.icon
		},
		setShadow : function(T) {
			if ( T instanceof t) {
				this._config.shadow = T
			}
		},
		getShadow : function() {
			return this._config.shadow
		},
		getPosition : function() {
			return this.point
		},
		setPosition : function(T) {
			if ( T instanceof f) {
				this.point = new f(T.lng, T.lat)
			}
		},
		setTop : function(aV, T) {
			this._config.isTop = !!aV;
			if (aV) {
				this._addi = T || 0
			}
		},
		setTitle : function(T) {
			this._config.title = T + ""
		},
		getTitle : function() {
			return this._config.title
		},
		setOffset : function(T) {
			if ( T instanceof X) {
				this._config.offset = T
			}
		},
		getOffset : function() {
			return this._config.offset
		}
	});
	function ak(T, aW) {
		av.call(this, aW);
		this.setPath(T);
		var aV = this;
		ar.load("poly", function() {
			aV._draw()
		})
	}
	aK.lang.inherits(ak, av, "Polyline");
	function aF(T) {
		this.map = T;
		this.mapTypeLayers = [];
		this.tileLayers = [];
		this.bufferNumber = 30;
		this.realBufferNumber = 0;
		this.mapTiles = {};
		this.bufferTiles = {};
		this.numLoading = 0;
		this.isFirstTile = true;
		this.arrStatTraffic = [];
		this.isZooming = false;
		this.isVectorLoaded = false;
		this._mapTypeLayerContainer = this._createDiv(-1);
		this._vectorLayerContainer = this._createDiv(2);
		this._normalLayerContainer = this._createDiv(3);
		T.platform.appendChild(this._mapTypeLayerContainer);
		T.platform.appendChild(this._vectorLayerContainer);
		T.platform.appendChild(this._normalLayerContainer)
	}
	BMap.register(function(aV) {
		var T = new aF(aV);
		T.initialize();
		aV.tileMgr = T
	});
	aK.extend(aF.prototype, {
		initialize : function() {
			var T = this, aV = T.map;
			aV.addEventListener("loadcode", function() {
				T.loadTiles()
			});
			aV.addEventListener("addtilelayer", function(aW) {
				T.addTileLayer(aW)
			});
			aV.addEventListener("removetilelayer", function(aW) {
				T.removeTileLayer(aW)
			});
			aV.addEventListener("zoomstartcode", function(aW) {
				T._zoom()
			});
			aV.addEventListener("dblclick", function(aW) {
				T.dblClick(aW)
			});
			aV.addEventListener("moving", function(aW) {
				T.moveGridTiles()
			});
			aV.addEventListener("resize", function(aW) {
				T.moveGridTiles()
			});
			aV.addEventListener("zoomend", function(aW) {
				T.setRasterTrafficStatus(aW)
			});
			aV.addEventListener("vectorloaded", function(aW) {
				T.isVectorLoaded = true
			});
			T.addMapClickEvent()
		},
		loadTiles : function() {
			var aX = this;
			aX.lastZoom = aX.map.getZoom();
			if (!aX.loaded) {
				aX.initMapTypeTiles()
			}
			aX.moveGridTiles();
			if (!aX.loaded) {
				aX.loaded = true;
				if (aX.map.vectorMapEnabled()) {
					var aY = "vector", aW = window.asyncMdlVer[aY], T = "async_" + aY + "_" + aW, aV = window.getVersion(T);
					if (aW && aV) {
						ar.run(aY, aV);
						aX.initVectorDrawLib()
					} else {
						ar.load("vector", function() {
							aX.initVectorDrawLib()
						}, true)
					}
				}
			}
		},
		initVectorDrawLib : function() {
			this.vectorDrawLib = new BMap.VectorDrawLib(this)
		},
		initMapTypeTiles : function() {
			var aV = this.map.getMapType();
			var aW = aV.getTileLayers();
			for (var T = 0; T < aW.length; T++) {
				var aX = new C();
				aK.extend(aX, aW[T]);
				this.mapTypeLayers.push(aX);
				aX.initialize(this.map, this._mapTypeLayerContainer)
			}
		},
		_createDiv : function(aV) {
			var T = r("div");
			T.style.position = "absolute";
			T.style.left = T.style.top = "0";
			T.style.zIndex = aV;
			return T
		},
		_checkTilesLoaded : function() {
			this.numLoading--;
			var T = this;
			if (this.isFirstTile) {
				this.map.dispatchEvent(new ay("onfirsttileloaded"));
				this.isFirstTile = false
			}
			if (this.numLoading == 0) {
				if (this._checkLoadedTimer) {
					clearTimeout(this._checkLoadedTimer);
					this._checkLoadedTimer = null
				}
				this._checkLoadedTimer = setTimeout(function() {
					if (T.numLoading == 0) {
						T.map.dispatchEvent(new ay("ontilesloaded"));
						T.isFirstTile = true
					}
					T._checkLoadedTimer = null
				}, 80)
			}
		},
		getTileName : function(T, aV) {
			return "TILE-" + aV.guid + "-" + T[0] + "-" + T[1] + "-" + T[2]
		},
		hideTile : function(aV) {
			var T = aV.img;
			if (T) {
				if (q(T)) {
					T.parentNode.removeChild(T)
				}
			}
			delete this.mapTiles[aV.name];
			if (!aV.loaded) {
				T = null;
				aV._callCbks();
				aV.img = null;
				aV.mgr = null
			}
		},
		moveGridTiles : function() {
			this.arrStatTraffic.length = [];
			var bl = this.mapTypeLayers, a4 = bl.concat(this.tileLayers), a9 = a4.length;
			var be = 1;
			for (var bd = 0; bd < a9; bd++) {
				var aX = a4[bd];
				if (aX.forceHighResolution === true) {
					be = 2
				}
				if (aX.baseLayer) {
					this.tilesDiv = aX.tilesDiv;
					var ba = this.tilesDiv;
					if (this.map.getZoom() >= this.map.config.vectorMapLevel) {
						ba.style.display = "none";
						continue
					} else {
						ba.style.display = "block"
					}
				}
				if (aX._isVectorLayer) {
					continue
				}
				var bq = this.map, bm = bq.getMapType(), br = bm.getProjection(), bc = bq.getZoom() + (be == 2 ? 1 : 0), bg = bq.mercatorCenter;
				var a2 = bm.getZoomUnits(bc) * be, a5 = bm.getZoomFactor(bc), a3 = Math.ceil(bg.lng / a5), aY = Math.ceil(bg.lat / a5), a8 = bm.getTileSize() / be, aW = [a3, aY, (bg.lng - a3 * a5) / a5 * a8, (bg.lat - aY * a5) / a5 * a8], bk = aW[0] - Math.ceil((bq.width / 2 - aW[2]) / a8), aV = aW[1] - Math.ceil((bq.height / 2 - aW[3]) / a8), bh = aW[0] + Math.ceil((bq.width / 2 + aW[2]) / a8), a6 = aW[1] + Math.ceil((bq.height / 2 + aW[3]) / a8);
				var T = this.mapTiles, a1 = -bg.lng / a2, a0 = bg.lat / a2, bo = [Math.round(a1), Math.round(a0)];
				for (var bp in T) {
					var bs = T[bp], bn = bs.info;
					if (bn[2] != bc || (bn[2] == bc && (bk > bn[0] || bh <= bn[0] || aV > bn[1] || a6 <= bn[1]))) {
						if (be == 2) {
							if (bs._svc == 2) {
								this.hideTile(bs)
							}
						} else {
							this.hideTile(bs)
						}
					}
				}
				var aZ = -bq.offsetX + bq.width / 2, a7 = -bq.offsetY + bq.height / 2;
				aX.tilesDiv.style.left = aZ + "px";
				aX.tilesDiv.style.top = a7 + "px";
				if (this.tilesOrder) {
					this.tilesOrder.length = 0
				} else {
					this.tilesOrder = []
				}
				if (bq._viewTiles) {
					bq._viewTiles.length = 0
				} else {
					bq._viewTiles = []
				}
				for (var bj = bk; bj < bh; bj++) {
					for (var bi = aV; bi < a6; bi++) {
						this.tilesOrder.push([bj, bi]);
						bq._viewTiles.push({
							x : bj,
							y : bi
						})
					}
				}
				this.tilesOrder.sort((function(bt) {
					return function(bu, bv) {
						return ((0.4 * Math.abs(bu[0] - bt[0]) + 0.6 * Math.abs(bu[1] - bt[1])) - (0.4 * Math.abs(bv[0] - bt[0]) + 0.6 * Math.abs(bv[1] - bt[1])))
					}
				})([aW[0] - 1, aW[1] - 1]));
				if (!this.map.enableLoadTiles) {
					return
				}
				var bb = aX.baseLayer ? true : false;
				if (bb) {
					this.map.dispatchEvent(new ay("ontilesbegin"));
					this.numLoading += this.tilesOrder.length
				}
				if ( aX instanceof aj) {
					this.map.dispatchEvent(new ay("onTrafficbegin"))
				}
				for (var bj = 0, bf = this.tilesOrder.length; bj < bf; bj++) {
					this.showTile([this.tilesOrder[bj][0], this.tilesOrder[bj][1], bc], bo, aX, be)
				}
			}
		},
		showTile : function(aZ, aY, a2, a6) {
			var a7 = this, a4 = a2.baseLayer ? true : false;
			var a1 = this.map.getMapType(), aW = a7.getTileName(aZ, a2), a8 = a1.getTileSize() / a6, aX = (aZ[0] * a8) + aY[0], aV = (-1 - aZ[1]) * a8 + aY[1], a3 = [aX, aV], a5 = this.mapTiles[aW];
			if (a5 && a5.img) {
				aU(a5.img, a3);
				if (a4) {
					if (a5.loaded) {
						this._checkTilesLoaded()
					} else {
						a5._addLoadCbk(function() {
							a7._checkTilesLoaded()
						})
					}
				}
				return
			}
			a5 = this.bufferTiles[aW];
			if (a5 && a5.img) {
				a2.tilesDiv.insertBefore(a5.img, a2.tilesDiv.lastChild);
				this.mapTiles[aW] = a5;
				aU(a5.img, a3);
				if (a4) {
					if (a5.loaded) {
						this._checkTilesLoaded()
					} else {
						a5._addLoadCbk(function() {
							a7._checkTilesLoaded()
						})
					}
				}
				return
			}
			var a0 = new aP(aZ[0], aZ[1]), T = a2.getTilesUrl(a0, aZ[2]);
			a5 = new az(this, T, a3, aZ, a2, a6);
			if (a4) {
				a5._addLoadCbk(function() {
					a7._checkTilesLoaded()
				})
			}
			a5._load();
			a5._svc = a6;
			this.mapTiles[aW] = a5
		},
		addTileLayer : function(aY) {
			var aX = this;
			var aV = aY.target;
			for (var aW = 0; aW < aX.tileLayers.length; aW++) {
				if (aX.tileLayers[aW] == aV) {
					return
				}
			}
			aX.tileLayers.push(aV);
			var T = aV._isVectorLayer ? this._vectorLayerContainer : this._normalLayerContainer;
			aV.initialize(this.map, T);
			if (aX.map.loaded) {
				aX.moveGridTiles()
			}
		},
		removeTileLayer : function(aZ) {
			var a0 = this, aX = aZ.target, aV = a0.mapTiles, a2 = a0.bufferTiles;
			for (var T in a2) {
				var a1 = T.split("-")[1];
				if (a1 == aX.guid) {
					delete a2[T]
				}
			}
			for (var T in aV) {
				var a1 = T.split("-")[1];
				if (a1 == aX.guid) {
					delete aV[T]
				}
			}
			for (var aY = 0, aW = a0.tileLayers.length; aY < aW; aY++) {
				if (aX == a0.tileLayers[aY]) {
					a0.tileLayers.splice(aY, 1)
				}
			}
			aX.remove();
			a0.moveGridTiles()
		},
		_zoom : function(aV, aY) {
			var a3 = this, aX = g();
			if ((aK.platform.isAndroid && !aX) || (a3.map.vectorMapEnabled() && a3.isVectorLoaded === false)) {
				a3.moveGridTiles();
				a3.map.dispatchEvent(new ay("onzoomend"));
				return
			}
			var T = a3.map, a8 = T.getZoom();
			if (a8 == a3.lastZoom) {
				return
			}
			var a6 = a8 > a3.lastZoom ? true : false;
			a3.lastZoom = a8;
			if (a3.isZooming === true) {
				return
			}
			a3.isZooming = true;
			var a4 = T.platform.style, a1 = T.offsetX, a0 = T.offsetY, aZ = T.width, a2 = T.height, a7 = aV ? (aV.x - a1) : (aZ / 2 - a1), a5 = aV ? (aV.y - a0) : (a2 / 2 - a0);
			a4.WebkitTransformOrigin = a7 + "px " + a5 + "px";
			aY = aY || new X(0, 0);
			var aW = new aL({
				duration : 300,
				transition : h.easeInOutQuad,
				fps : 40,
				render : function(a9) {
					var ba = a6 ? 1 + a9 : 1 - a9 / 2;
					a4.WebkitTransformOrigin = a7 + "px " + a5 + "px";
					a4.WebkitTransform = "translate3d(" + (-aY.width) * a9 + "px, " + (-aY.height) * a9 + "px,0px) scale(" + ba + ")"
				},
				finish : function() {
					a3.moveGridTiles();
					a3.map.dispatchEvent(new ay("onzoomend"));
					a4.WebkitTransform = "";
					a3.isZooming = false
				}
			})
		},
		dblClick : function(aZ) {
			var aV = this.map;
			if (!aV.config.enableDblclickZoom) {
				return
			}
			var a0 = aZ.pixel, aW = a0, aX = new X(0, 0), T = aV.zoomLevel + 1, aY = aV._getProperZoom(T);
			if (!aY.exceeded) {
				aV.dispatchEvent(new ay("onzoomstart"));
				aV.lastLevel = aV.zoomLevel;
				aV.zoomLevel = aY.zoom;
				var a1 = aV.mercatorCenter;
				aV.mercatorCenter = this._getMercatorCenter(a0);
				aV.centerPoint = aV.mercatorCenter;
				aX.width = a0.x - Math.round(aV.width / 2);
				aX.height = a0.y - Math.round(aV.height / 2);
				this._zoom(aW, aX);
				if (!a1.equals(aV.mercatorCenter)) {
					var a2 = new ay("onmoveend");
					a2._eventSrc = "centerAndZoom";
					aV.dispatchEvent(a2)
				}
			} else {
				var a3 = aV.pixelToPoint(a0);
				aV.panTo(a3)
			}
		},
		_getMercatorCenter : function(aW) {
			var aZ = this.map;
			var aX = aZ.mercatorCenter;
			var T = aZ.getMapType().getZoomUnits(aZ.lastLevel);
			var aV = aX.lng + T * (aW.x - aZ.width / 2);
			var aY = aX.lat - T * (aW.y - aZ.height / 2);
			return new f(aV, aY)
		},
		addMapClickEvent : function() {
			var aW = this, T = 200, aX = null, aV = 0;
			aW.map.addEventListener("click", function(aY) {
				aV++;
				if (aV == 1) {
					aX = setTimeout(function() {
						aV = 0;
						var aZ = null, a1 = aW.tileLayers;
						for (var a0 in a1) {
							if (a1[a0] instanceof al) {
								aZ = a1[a0];
								break
							}
						}
						if (aZ && aZ.vectorClick(aY)) {
							return
						}
						if (aW.vectorDrawLib) {
							aW.vectorDrawLib.vectorClick(aY)
						}
					}, T)
				} else {
					clearTimeout(aX);
					aV = 0;
					return false
				}
			})
		},
		setRasterTrafficStatus : function(aX) {
			var aV = this, aW = aV.map, T = aW.getZoom();
			if (!aV.rasterTrafficLayer) {
				aV.rasterTrafficLayer = new aj()
			}
			if (aW.config.trafficStatus && T < aW.config.vectorMapLevel) {
				aW.addTileLayer(aV.rasterTrafficLayer)
			} else {
				aW.removeTileLayer(aV.rasterTrafficLayer)
			}
		},
		setVectorTrafficStatus : function(T) {
			if (this.vectorDrawLib) {
				this.vectorDrawLib.reDrawVectorMap()
			}
		}
	});
	function az(a2, T, aY, aV, aX, aZ) {
		this.mgr = a2;
		this.position = aY;
		this._cbks = [];
		this.name = a2.getTileName(aV, aX);
		this.info = aV;
		this.level = parseInt(aV[2], 10);
		var a3 = r("img");
		n(a3);
		a3.galleryImg = false;
		var a1 = a3.style;
		var aW = a2.map.getMapType(), a4 = aW.getTileSize() / aZ;
		a1.position = "absolute";
		if (g()) {
			a1.WebkitTransform = "translate3d(0px,0px,0)"
		}
		a1.width = a4 + "px";
		a1.height = a4 + "px";
		a1.left = aY[0] + "px";
		a1.top = aY[1] + "px";
		this.img = a3;
		this.src = T;
		var a0 = this;
		this.img.onload = function(bc) {
			a0.loaded = true;
			if (!a0.mgr) {
				return
			}
			var a9 = a0.mgr;
			var bd = a9.bufferTiles;
			if (!bd[a0.name]) {
				a9.realBufferNumber++;
				bd[a0.name] = a0
			}
			if (a0.img && !q(a0.img)) {
				if (aX.tilesDiv) {
					aX.tilesDiv.appendChild(a0.img)
				}
			}
			var be = a9.realBufferNumber - a9.bufferNumber;
			for (var a6 in bd) {
				if (be <= 0) {
					break
				}
				if (!a9.mapTiles[a6]) {
					bd[a6].mgr = null;
					var bb = bd[a6].img;
					if (bb && bb.parentNode) {
						bb.parentNode.removeChild(bb)
					}
					bb = null;
					bd[a6].img = null;
					delete bd[a6];
					a9.realBufferNumber--;
					be--
				}
			}
			a0._callCbks();
			var a5 = this.src, a7 = a2.arrStatTraffic;
			if (a5.indexOf("TrafficTileService") > -1) {
				for (var ba = 0, a8 = a7.length; ba < a8; ba++) {
					if (a5.indexOf(a7[ba]) > -1) {
						a7.splice(ba, 1);
						break
					}
				}
				if (a7.length <= 0) {
					a2.map.dispatchEvent(new ay("onTrafficloaded"))
				}
			}
		};
		this.isHighResolution = a2.map.highResolutionEnabled();
		this.img.onerror = function() {
			var a6 = a0.img, a8 = a6 ? a6.getAttribute("errorCount") : true;
			if (a6 && (!a8 || a8 && a8 < 5)) {
				a8 = a8 || 0;
				a8++;
				a6.src = T;
				a6.setAttribute("errorCount", a8)
			} else {
				a0._callCbks();
				if (!a0.mgr) {
					return
				}
				var a5 = a0.mgr;
				var a7 = a5.map.getMapType();
				if (a7.getErrorImageUrl()) {
					a0.error = true;
					a0.img.src = a7.getErrorImageUrl();
					if (a0.img && !q(a0.img)) {
						aX.tilesDiv.appendChild(a0.img)
					}
				}
			}
		};
		a3 = null
	}
	az.prototype._addLoadCbk = function(T) {
		this._cbks.push(T)
	};
	az.prototype._load = function() {
		this.img.src = this.src
	};
	az.prototype._callCbks = function() {
		var aV = this;
		for (var T = 0; T < aV._cbks.length; T++) {
			aV._cbks[T]()
		}
		aV._cbks.length = 0
	};
	function C(T) {
		this.opts = T || {};
		this.baseLayer = this.opts.baseLayer || false;
		this.zIndex = this.opts.zIndex || 0;
		this.guid = C._guid++
	}
	C._guid = 0;
	aK.lang.inherits(C, aK.lang.Class, "TileLayer");
	aK.extend(C.prototype, {
		initialize : function(aW, T) {
			if (this.baseLayer) {
				this.zIndex = -100
			}
			this.map = aW;
			if (!this.tilesDiv) {
				var aX = r("div");
				var aV = aX.style;
				aV.position = "absolute";
				aV.zIndex = this.zIndex;
				aV.left = Math.ceil(-aW.offsetX + aW.width / 2) + "px";
				aV.top = Math.ceil(-aW.offsetY + aW.height / 2) + "px";
				T.appendChild(aX);
				this.tilesDiv = aX
			}
		},
		remove : function() {
			if (this.tilesDiv && this.tilesDiv.parentNode) {
				this.tilesDiv.innerHTML = "";
				this.tilesDiv.parentNode.removeChild(this.tilesDiv)
			}
			delete this.tilesDiv
		},
		getTilesUrl : function(aV, aW) {
			var T = "";
			if (this.opts.tileUrlTemplate) {
				T = this.opts.tileUrlTemplate.replace(/\{X\}/, aV.x);
				T = T.replace(/\{Y\}/, aV.y);
				T = T.replace(/\{Z\}/, aW)
			}
			return T
		},
		getMapType : function() {
			return this.mapType
		}
	});
	function aj(T) {
		C.call(this, T);
		this._opts = {};
		T = T || {};
		this._opts = aK.object.extend(this._opts, T);
		if (this._opts.predictDate) {
			if (this._opts.predictDate.weekday < 1 || this._opts.predictDate.weekday > 7) {
				this._opts.predictDate = 1
			}
			if (this._opts.predictDate.hour < 0 || this._opts.predictDate.hour > 23) {
				this._opts.predictDate.hour = 0
			}
		}
		this._tileUrl = "http://its.map.baidu.com:8002/traffic/"
	}
	aj.prototype = new C();
	aj.prototype.initialize = function(aV, T) {
		C.prototype.initialize.call(this, aV, T);
		this._map = aV
	};
	aj.prototype.getTilesUrl = function(a2, aV) {
		var aW = this._map.tileMgr.arrStatTraffic, aZ = "level=" + aV + "&x=" + a2.x + "&y=" + a2.y;
		aW.push(aZ);
		var a3 = "";
		if (this._opts.predictDate) {
			a3 = "HistoryService?day=" + (this._opts.predictDate.weekday - 1) + "&hour=" + this._opts.predictDate.hour + "&t=" + new Date().getTime() + "&"
		} else {
			a3 = "TrafficTileService?time=" + new Date().getTime() + "&"
		}
		var aX = this._map, a4 = a2.x, aY = a2.y, a1 = Math.floor(a4 / 200), a0 = Math.floor(aY / 200), T = this._tileUrl + a3 + "level=" + aV + "&x=" + a4 + "&y=" + aY;
		return T.replace(/-(\d+)/gi, "M$1")
	};
	function Q(T) {
		C.call(this, T);
		this._opts = {};
		T = T || {};
		this._opts = aK.object.extend(this._opts, T);
		this.curTimeStamp = new Date().getTime();
		this.interval = 1800000;
		this.uid = this._opts.uid || "";
		this.layerVersion = this._opts.layerVersion;
		this._tileUrls = ["http://shangetu0.map.bdimg.com/it/", "http://shangetu1.map.bdimg.com/it/", "http://shangetu2.map.bdimg.com/it/", "http://shangetu3.map.bdimg.com/it/", "http://shangetu4.map.bdimg.com/it/"]
	}
	Q.prototype = new C();
	Q.prototype.initialize = function(aV, T) {
		C.prototype.initialize.call(this, aV, T);
		this._map = aV
	};
	Q.prototype.getTilesUrl = function(aV, aZ) {
		var aY = this, T = new Date().getTime();
		if (T - aY.curTimeStamp >= aY.interval) {
			aY.curTimeStamp = T
		}
		var a1 = aV.x, aX = aV.y, a0 = "u=x=" + a1 + ";y=" + aX + ";z=" + aZ + ";v=" + aY.layerVersion + ";type=hot" + (aY.uid ? (";s=" + aY.uid) : "") + "&fm=44&t=" + aY.curTimeStamp, aW = aY._tileUrls[Math.abs(a1 + aX) % aY._tileUrls.length] + a0;
		return aW.replace(/-(\d+)/gi, "M$1")
	};
	function al(aX, aW) {
		var aV = {
			zIndex : 1
		};
		C.call(this, aV);
		this._keyWord = aX;
		this._cityCode = aW;
		this._isVectorLayer = true;
		this._map = null;
		this._container = null;
		var T = this;
		ar.load("layer", function() {
			T._asyncLoadCode()
		})
	}
	aK.inherits(al, C, "VectorMDLayer");
	aK.extend(al.prototype, {
		initialize : function(aV, T) {
			this._map = aV;
			this._container = T
		},
		remove : function() {
			this._map = null;
			this._container = null
		},
		setKeyword : function(T) {
			this._keyWord = T
		},
		getKeyword : function() {
			return this._keyWord
		},
		setCityCode : function(T) {
			this._cityCode = T
		},
		getCityCode : function() {
			return this._cityCode
		},
		refreshLayer : function() {
		}
	});
	function aO(T, aV, aW) {
		this._name = T;
		this._layers = aV instanceof C ? [aV] : aV.slice(0);
		this._opts = {
			tips : "",
			labelText : "",
			minZoom : 3,
			maxZoom : 18,
			tileSize : 256,
			textColor : "black",
			errorImageUrl : "",
			projection : new aA(this)
		};
		if (this._layers.length == 1) {
			this._layers[0].baseLayer = true
		}
		aK.extend(this._opts, aW || {})
	}
	aK.extend(aO.prototype, {
		getName : function() {
			return this._name
		},
		getTips : function() {
			return this._opts.tips
		},
		getLabelText : function() {
			return this._opts.labelText
		},
		getTileLayer : function() {
			return this._layers[0]
		},
		getTileLayers : function() {
			return this._layers
		},
		getTileSize : function() {
			this._opts.tileSize = 256;
			var T = this._opts.mapInstance;
			if (T.highResolutionEnabled() && T.getZoom() < T.config.vectorMapLevel) {
				this._opts.tileSize = 128
			}
			return this._opts.tileSize
		},
		getMinZoom : function() {
			return this._opts.minZoom
		},
		getMaxZoom : function() {
			return this._opts.maxZoom
		},
		getTextColor : function() {
			return this._opts.textColor
		},
		getProjection : function() {
			return this._opts.projection
		},
		getErrorImageUrl : function() {
			return this._opts.errorImageUrl
		},
		getZoomUnits : function(aV) {
			var aX = 1, aW = this._opts.mapInstance, T = this._opts.maxZoom;
			if (aW.highResolutionEnabled() && aW.getZoom() < aW.config.vectorMapLevel) {
				aX = 2
			}
			return Math.pow(2, (T - aV)) * aX
		},
		getZoomFactor : function(T) {
			return this.getZoomUnits(T) * this.getTileSize()
		}
	});
	var v = {
		pd : {
			host : ["http://online1.map.bdimg.com/it/", "http://online2.map.bdimg.com/it/", "http://online3.map.bdimg.com/it/", "http://online4.map.bdimg.com/it/"],
			params : {
				fm : 42,
				f : "webapp",
				format_add : ".jpg"
			}
		},
		hd : {
			host : ["http://online1.map.bdimg.com/it/", "http://online2.map.bdimg.com/it/", "http://online3.map.bdimg.com/it/", "http://online4.map.bdimg.com/it/"],
			params : {
				format : "jpeg",
				fm : 41,
				quality : 70,
				f : "webapp",
				format_add : ".jpg"
			}
		}
	};
	var aE = new C();
	aE.getTilesUrl = function(aV, a2) {
		var a3 = aV.x, aX = aV.y, aW, aY;
		var aZ = BMap.TILE_CONFIG || v;
		if (this.map.highResolutionEnabled()) {
			aW = aZ.hd;
			if ( typeof TVC != "undefined") {
				aY = TVC.webapp.high_normal
			}
		} else {
			aW = aZ.pd;
			if ( typeof TVC != "undefined") {
				aY = TVC.webapp.lower_normal
			}
		}
		var a4 = "u=x=" + a3 + ";y=" + aX + ";z=" + a2;
		if (aY && aY.version) {
			a4 += ";v=" + aY.version
		} else {
			a4 += ";v=014"
		}
		a4 += ";type=web";
		var a1 = aW.host[Math.abs(a3 + aX) % aW.host.length];
		if (!a1) {
			a1 = aW.host[0]
		}
		var T = a1 + a4;
		if (aY && aY.updateDate) {
			T += "&udt=" + aY.updateDate
		}
		for (var a0 in aW.params) {
			T += "&" + a0 + "=" + aW.params[a0]
		}
		return T.replace(/-(\d+)/gi, "M$1")
	};
	function B(T, aX) {
		this._container = typeof T == "string" ? aK.g(T) : T;
		this._opts = {
			linksControl : true,
			enableDoubleClickZoom : true,
			showInnerView : true,
			pidForInner : null
		};
		this._povChangedByUser = false;
		aX = aX || {};
		for (var aV in aX) {
			this._opts[aV] = aX[aV]
		}
		this._pov = {
			heading : 0,
			pitch : 0
		};
		this._links = [];
		this._overlays = [];
		this._id = null;
		this._position = null;
		this._zoom = 2;
		this._description = "";
		this._mode = "";
		this._time = "";
		var aW = this;
		ar.load("streetview", function() {
			aW._draw()
		});
		this._init()
	}
	B.MAX_ZOOM = 5;
	B.MIN_ZOOM = 0;
	aK.lang.inherits(B, aK.lang.Class, "StreetView");
	aK.extend(B.prototype, {
		_init : function() {
		},
		getLinks : function() {
			return this._links
		},
		getId : function() {
			return this._id
		},
		getPosition : function() {
			return this._position
		},
		getPov : function() {
			return this._pov
		},
		getZoom : function() {
			return this._zoom
		},
		getDescription : function() {
			return this._description
		},
		getRelevants : function() {
			return this._relevants || []
		},
		getMode : function() {
			return this._mode
		},
		setId : function(aV, T) {
			if (aV == this._id) {
				return
			}
			this._lastId = this._id;
			this._id = aV;
			this._position = null;
			this._opts.pidForInner = T ? aV : null;
			this._opts.showInnerView = T ? true : false;
			this._iid = T
		},
		setStreetId : function(aV, T) {
			T = T || {};
			if (aV === this._streetId && T.pid === this._opts.pidForInner) {
				return
			}
			this._opts.pidForInner = T.pid || null;
			this._opts.showInnerView = T.showInnerView || false;
			this._lastStreetId = this._streetId;
			this._streetId = aV;
			this._id = null;
			this._iid = null;
			this._position = null
		},
		setPosition : function(T) {
			if (T.equals(this._position)) {
				return
			}
			this._lastId = this._id;
			this._position = T;
			this._id = null;
			this._streetId = null
		},
		setPov : function(T) {
			this._pov = T;
			if (this._pov.pitch > 45) {
				this._pov.pitch = 45
			}
			if (this._pov.pitch < -10) {
				this._pov.pitch = -10
			}
			this._povChangedByUser = true
		},
		setZoom : function(T) {
			if (T == this._zoom) {
				return
			}
			if (T > B.MAX_ZOOM) {
				T = B.MAX_ZOOM
			}
			if (T < B.MIN_ZOOM) {
				T = B.MIN_ZOOM
			}
			if (T != this._zoom) {
				this._zoom = T
			}
		},
		enableDoubleClickZoom : function() {
			this._opts.enableDoubleClickZoom = true
		},
		disableDoubleClickZoom : function() {
			this._opts.enableDoubleClickZoom = false
		},
		clear : function() {
			this._data = null;
			this._id = null;
			this._position = null;
			this._links = [];
			this.dispatchEvent(new ay("onclear"))
		}
	});
	function aJ() {
		var T = "20140616";
		if (window.TVC && TVC.ditu && TVC.ditu.panoUdt) {
			T = TVC.ditu.panoUdt.version
		}
		return T
	}

	function l() {
		C.call(this);
		this.forceHighResolution = true
	}
	l.URLS = ["http://pcsv0.map.bdimg.com/tile/", "http://pcsv1.map.bdimg.com/tile/"];
	l.prototype = new C();
	l.prototype.getTilesUrl = function(aY, aX) {
		var aV = (Math.abs(aY.x) + Math.abs(aY.y)) % l.URLS.length;
		var aW = "pl";
		var T = l.URLS[aV] + "?udt=" + aJ() + "&qt=tile&styles=" + aW + "&x=" + aY.x + "&y=" + aY.y + "&z=" + aX;
		return T.replace(/-(\d+)/gi, "M$1")
	};
	function J(T) {
		this._streetView = T;
		this._poi = null;
		this._dom = null;
		this._title = "";
		this._clickToInner = false;
		this._distance = null;
		this._visible = true
	}
	aK.extend(J.prototype, {
		setData : function(T) {
			this._data = T;
			if (T === null || (T.type != "street" && !T.poi)) {
				this._removePrevious();
				this._poi = null;
				this._dom = null;
				this._title = "";
				return
			}
			if (T.poi) {
				this._poi = T.poi;
				this._title = T.poi.title
			}
			if (T.iid) {
				this._clickToInner = true
			} else {
				this._clickToInner = false
			}
			this._init()
		},
		_init : function() {
			var a0 = this._poi;
			if (!a0) {
				return
			}
			var aY = this._data.pointX;
			var aX = this._data.pointY;
			this._distance = this._calcDistance(aY, aX, a0.position.lng, a0.position.lat);
			if (this._distance > 150) {
				this._visible = false;
				return
			} else {
				this._visible = true
			}
			var a1 = a0.position.lng - aY;
			var aW = a0.position.lat - aX;
			var aV = a1 / aW;
			var aZ = Math.atan(aV) * 180 / Math.PI;
			aZ = (aZ + 90) % 90;
			var T = 0;
			if (a1 > 0 && aW < 0) {
				T = 90
			}
			if (a1 < 0 && aW < 0) {
				T = 180
			}
			if (a1 < 0 && aW > 0) {
				T = 270
			}
			aZ += T;
			aZ = Math.round(aZ);
			a0.angle = aZ;
			if (!this._dom) {
				this._dom = this._addPoiLabel()
			}
			this._textDom.innerHTML = ['<span style="margin:0 14px">' + this._title + "</span>", '<span style="color:rgba(255,255,255,0.3)">|</span>', '<span style="margin:0 8px;color:#60c7fa;font-size:12px;vertical-align:1px">' + Math.round(this._distance) + "米</span>"].join("")
		},
		_addPoiLabel : function() {
			var aY = r("div");
			var aW = aY.style;
			aW.position = "absolute";
			aW.backgroundColor = "rgba(29, 29, 29, 0.8)";
			aW.paddingTop = "7px";
			aW.height = "26px";
			aW.font = "16px arial";
			aW.color = "white";
			aW.whiteSpace = "nowrap";
			aW.borderRadius = "4px";
			var aV = null;
			if (this._data.iid) {
				aV = r("img");
				aV.src = aT.imgPath + "poi_inner_icon.png";
				var T = aV.style;
				T.width = "33px";
				T.height = "33px";
				T.position = "absolute";
				T.left = "0";
				T.top = "0";
				T.border = "none";
				T.WebkitTransform = T.transform = "translateZ(0)";
				aW.paddingLeft = "33px";
				aY.appendChild(aV)
			}
			this._textDom = r("div");
			this._textDom.style["float"] = "left";
			aY.appendChild(this._textDom);
			this._streetView._overlayContainer.appendChild(aY);
			var aX = this;
			aY._id = this._data.id;
			aY._iid = this._data.iid;
			aY._streetId = this._data.streetId;
			aY._heading = this._data.heading || 0;
			aK.on(aY, "touchstart", function(aZ) {
				aZ.stopPropagation();
				aZ.preventDefault()
			});
			if (aV) {
				aV._streetId = this._data.streetId;
				aK.on(aV, "touchend", function(a1) {
					var aZ = this._streetId;
					aX._streetView.clear();
					aX._streetView.setStreetId(aZ, {
						showInnerView : true
					});
					var a0 = new ay("onpoiclick");
					a0.clickArea = "icon";
					aX._streetView.dispatchEvent(a0);
					a1.stopPropagation();
					a1.preventDefault()
				})
			}
			aK.on(aY, "touchend", function(a0) {
				if (this._id != aX._data.id) {
					aX._streetView.clear();
					aX._streetView.setStreetId(this._streetId)
				} else {
					var a1 = aX._streetView.getPov().pitch;
					aX._streetView.setPov({
						heading : this._heading,
						pitch : a1
					})
				}
				var aZ = new ay("onpoiclick");
				aZ.clickArea = "text";
				aX._streetView.dispatchEvent(aZ);
				a0.stopPropagation();
				a0.preventDefault()
			});
			return aY
		},
		render : function(aW, T, aV) {
			var a0 = this._dom;
			if (!a0) {
				return
			}
			if (this._visible) {
				a0.style.display = ""
			} else {
				a0.style.display = "none";
				return
			}
			var aY = this._poi;
			var aX = aY.angle;
			var aZ = this._povToPoint(aX, 4, T, aV);
			a0.style.left = aZ[0] + "px";
			a0.style.top = aZ[1] + "px"
		},
		_povToPoint : function(a4, aV, a3, a2) {
			var a1 = this._streetView;
			var aW = a1.getPov().heading % 360;
			while (aW < 0) {
				aW = (aW + 360) % 360
			}
			var a5 = (a4 - aW) % 360;
			var T = a1._containerSize;
			var aX = this._data.tiles.getTotalCols(a3);
			var aZ = 360 / (aX * a2);
			if (a5 > 180) {
				a5 = a5 - 360
			} else {
				if (a5 < -180) {
					a5 = a5 + 360
				}
			}
			var a0 = (Math.round(T.width / 2 + a5 / aZ));
			var aY = Math.round(T.height / 2 - (aV - a1.getPov().pitch) / aZ);
			return [a0, aY]
		},
		_removePrevious : function() {
			if (this._dom && this._dom.parentNode) {
				this._dom.parentNode.removeChild(this._dom);
				this._dom = null
			}
		},
		_calcDistance : function(aV, aX, T, aW) {
			return Math.sqrt(Math.pow(T - aV, 2) + Math.pow(aW - aX, 2))
		}
	});
	function F(T, aV) {
		window.BMap[T] = aV
	}

	F("Map", z);
	F("Hotspot", L);
	F("MapType", aO);
	F("Point", f);
	F("Pixel", aP);
	F("Size", X);
	F("Bounds", u);
	F("TileLayer", C);
	F("RasterTrafficLayer", aj);
	F("SpotshotLayer", Q);
	F("VectorMDLayer", al);
	F("Overlay", N);
	F("Marker", E);
	F("Icon", t);
	F("Polyline", ak);
	F("Control", O);
	F("ScaleControl", R);
	F("StreetView", B);
	F("StreetViewCoverageLayer", l);
})();
