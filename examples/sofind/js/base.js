(function(){
    var Utils = {
        getArrayMostValue : function(arr, type){
            return Math[type].apply({}, arr);
        },
        C : function(ele){
            return document.createElement(ele);
        },
        setCss : function(eles, attr, value){
            for (var i = eles.length - 1; i >= 0; i--) {
                eles[i].style[attr] = value;
            };
        },
        getStyle : function(obj, attr){
            return getComputedStyle(obj, true)[attr];
        },
        setStyle : function(obj, attrs){
            for(var i in attrs){
                obj.style[i] = attrs[i];
            }
        },
        createEle : function(ele, style, className, innerHTML, appendTo){
            var e = this.C(ele);
            this.setStyle(e, style);
            className && (e.className = className);
            (innerHTML !== undefined) && (e.innerHTML = innerHTML);
            appendTo && appendTo.appendChild(e);
            return e;
        },
        mergeObj : function(){
            var result = {};
            for (var i = 0, l = arguments.length; i < l; i++) {
                var obj = arguments[i];
                for(var attr in obj){
                    result[attr] = obj[attr];
                }
            }
            return result;
        },
        addStyleSheets : function(className, style) {
            var tmp = document.styleSheets;
            var c = tmp[tmp.length - 1];
            c.insertRule(className + " { "+style+" }", c.cssRules.length);
        },
        defaultColors : ['#5A4440', '#539EA0', '#C29333', '#AC9FA2', '#A35347', '#6C8B79'],
        timeStamp : +new Date
    };

    if(!window.Charts){
        window.Charts = {};
    }

    window.Charts.Utils = Utils;
})();