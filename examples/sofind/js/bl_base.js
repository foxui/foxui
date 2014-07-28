(function(){
    var Utils = Charts.Utils,
        addStyleSheets = Utils.addStyleSheets,
        defaultColors = Utils.defaultColors,
        timeStamp = Utils.timeStamp;

    var log10 = function(a){
        return Math.log(a)/Math.log(10);
    };


    if(document.styleSheets.length == 0){
        document.getElementsByTagName('head')[0].appendChild(Utils.C('style'));
    }

    addStyleSheets('.coorY' + timeStamp, 'position: absolute;text-align: right;font-size: 10px;left:-63px;width: 60px;');
    addStyleSheets('.coorX' + timeStamp, 'font-size: 10px;text-align: center;position:absolute;bottom: -18px;white-space:nowrap;');
    addStyleSheets('.legend'       +timeStamp, 'bottom: -50px;font-size: 10px;padding: 4px;border-radius: 2px;border: #AAA 1px solid;');
    addStyleSheets('.legend-color' +timeStamp, 'border-radius: 2px;margin-right: 2px;display: inline-block;width: 10px;height: 10px;');
    addStyleSheets('.legend-name'  +timeStamp, 'margin-right: 10px;');

    var BLBase = function(){
        
    };

    BLBase.prototype = Utils.mergeObj(BLBase.prototype, {
        setBaseProperties : function(data){
            this.data = data;
            this.container = data.container;
            this.coordinate = Utils.C('canvas');
            this.coorCTX = null;
            this.plotCTX = null;
            this.commonAttr = {};
            this.seriesDataLength = data.series[0].data.length;
        },
        getSeriesMostValue : function(series, type){
            var arr = [];
            for(var i = 0; i < series.length; i++){
                arr.push(Math[type].apply({}, series[i].data));
            }
            return Math[type].apply({}, arr);
        },
        isOnStep : function(step, i, l){
            return onStep = !step || (step && i % step == 0) || (i==l-1);
        },
        setSeriesValueToPixel : function(){
            var commonAttr = this.commonAttr,
                data = this.data,
                series = data.series,
                serie,
                Y,
                YArr,
                step = data.xAxis.step;

            commonAttr.yAxis = [];

            for(var i = 0; i < series.length; i++){
                serie = series[i];
                YArr = [];
                var l = this.seriesDataLength;
                for(var j = 0; j < l; j++){
                    Y = ((serie.data[j]-commonAttr.minBound)/commonAttr.rangeY) * commonAttr.containerHeight;
                    YArr.push(Y);
                }
                commonAttr.yAxis.push(YArr);
            }
        },
        addCanvas : function(canvas, container){
            var w = this.commonAttr.containerWidth+20, h = this.commonAttr.containerHeight+20;
            canvas.width = w*2;
            canvas.height = h*2;
            canvas.style.cssText = "position:absolute;left:-10px;top:-10px;width:"+w+"px;height:"+h+"px";
            container.appendChild(canvas);
            ctx = canvas.getContext("2d");
            ctx.translate(20, 20);
            return ctx;
        },

        setBaseComponents : function(){
            var data = this.data,
                tmpWidthDelta = 40,
                paddingLeft = 30;

            if(data.yAxis && data.yAxis.labelVisible === false){
                tmpWidthDelta = 0;
                paddingLeft = 0;
            }

            var innerContainer = this.innerContainer = Utils.createEle('div', {
                position : 'relative',
                width : (this.container.clientWidth - tmpWidthDelta) + 'px',
                height : (this.container.clientHeight - 30) + 'px',
                margin: '6px 10px 0px '+ paddingLeft +'px',
                fontFamily: 'Arial'
            }, '', '', this.container);

            this.commonAttr.containerWidth = parseInt(this.innerContainer.clientWidth);
            this.commonAttr.containerHeight = parseInt(this.innerContainer.clientHeight);
            
            var posStyle = Utils.getStyle(innerContainer, 'position');

            if(["relative", "absolute"].indexOf(posStyle) < 0){
                innerContainer.style.position = "relative";
            }

            // 坐标
            this.coorCTX = this.addCanvas(this.coordinate, innerContainer);
        
            this.renderCoordinate();
            this.setSeriesValueToPixel();
            if(this.data.series.length > 1) this.renderLegend();
        },
        renderCoordX : function(){
            var commonAttr = this.commonAttr,
                data = this.data,
                container = this.innerContainer,
                coorCTX = this.coorCTX;

            if(data.xAxis){
                var categories = data.xAxis.categories, xAxis = data.xAxis;
                var l = categories.length, unit = commonAttr.containerWidth/l, X, label, xArr = [], step = data.xAxis.step;

                var hasLines = xAxis.tickVisible !== false;

                hasLines && coorCTX.beginPath();
                var halfStep = unit/2;
                for (var i = 0; i < l; i++){
                    X = unit*i + halfStep;
                    xArr.push(X);

                    var onStep = this.isOnStep(step, i, l);

                    if(hasLines && onStep){
                        coorCTX.moveTo(X*2, 0);
                        coorCTX.lineTo(X*2, commonAttr.containerHeight*2);
                    }

                    if(onStep){
                        label = Utils.createEle('div', {
                            color : xAxis.fontColor ? xAxis.fontColor : '#999'
                        }, 'coorX'+timeStamp, categories[i], container);

                        var leftPos = Math.max(0, Math.min(X - label.offsetWidth/2, commonAttr.containerWidth-label.offsetWidth));
                        label.style.left = leftPos + 'px'; 
                    }

                };
                
                if(hasLines){
                    coorCTX.strokeStyle = xAxis.lineColor || "#f2f2f2";
                    coorCTX.lineWidth = xAxis.lineWidth || 1;  
                    coorCTX.lineCap = "round";  
                    coorCTX.stroke();
                }
            }
            commonAttr.xAxis = xArr||[];
            commonAttr.xInterval = xArr ? xArr[1] - xArr[0] : 0;
        },
        getYAxisAttrs : function(min, max){
            var range = (max - min) || Math.abs(max);
            var tickCount = 4;
            var unroundedTickSize = range/(tickCount-1);
            // var exp = Math.ceil(Utils.log10(unroundedTickSize)-1);//得到数量级, 如32345，即exp=10^4
            var exp = parseInt(log10(unroundedTickSize));
            var pow10x = Math.pow(10, exp);

            var tmp = unroundedTickSize / pow10x;
            var roundedTickRange;
            if(tmp>2&&tmp<=2.5){
                roundedTickRange = 2.5 * pow10x;
            }else if(tmp>7&&tmp<=7.5){
                roundedTickRange = 7.5 * pow10x;
                tickCount += 1;
            }else{
                roundedTickRange = Math.ceil(tmp) * pow10x;
            }

            var newLowerBound = roundedTickRange * (Math.round(min/roundedTickRange)-1);
            var newUpperBound = roundedTickRange * Math.round(1 + max/roundedTickRange);

            return {
                'min' : newLowerBound,
                'max' : newUpperBound,
                'tickRange' : roundedTickRange,
                'tickCount' : parseInt((newUpperBound - newLowerBound)/roundedTickRange)
            };
        },
        renderCoordY : function(){
            var commonAttr = this.commonAttr,
                data = this.data,
                container = this.innerContainer,
                coorCTX = this.coorCTX;

            if(data.series && data.series.length > 0){
                var yAxis = data.yAxis;
                var hasLines = !yAxis || (yAxis.tickVisible !== false);

                var max = this.getSeriesMostValue(data.series, 'max');
                var min = this.getSeriesMostValue(data.series, 'min');
                commonAttr.min = min;
                commonAttr.max = max;

                var yAxisAttrs = this.getYAxisAttrs(min, max);
                var minBound = yAxisAttrs.min;
                var maxBound = yAxisAttrs.max;

                var tickCount = yAxisAttrs.tickCount;

                var pxStep = yAxisAttrs.tickRange/(maxBound - minBound)*commonAttr.containerHeight;

                commonAttr.minBound = minBound;
                commonAttr.maxBound = maxBound;

                var Y;
                hasLines && coorCTX.beginPath();
                for (var i = 0; i <= tickCount; i++){
                    Y = pxStep * i;
                    if(hasLines){
                        coorCTX.moveTo(0, Y*2);
                        coorCTX.lineTo(commonAttr.containerWidth*2, Y*2);
                    }
                    if(!yAxis || (yAxis && yAxis.labelVisible!==false)){
                        var val = minBound + i * yAxisAttrs.tickRange;
                        var innerHTML = (val+'').indexOf('.')>0 ? val.toFixed(2): val;

                        Utils.createEle('div', {
                            bottom : (Y-8)+'px',
                            color : yAxis && yAxis.fontColor || '#999',
                        }, 'coorY'+timeStamp, innerHTML, container);
                    }
                };

                if(hasLines){
                    coorCTX.strokeStyle = yAxis && yAxis.lineColor || "#f2f2f2";  
                    coorCTX.lineWidth = yAxis && yAxis.lineWidth || 1; 
                    coorCTX.stroke();
                }

                commonAttr.rangeY = maxBound - minBound;
            }
        },
        renderCoordinate : function(){
            this.renderCoordX();
            this.renderCoordY();
        },
        renderLegend : function(){
            var data = this.data,
                series = data.series,
                l = series.length,
                color,
                html = '',
                legend = Utils.C('div');

            legend.style.position = "absolute";
            legend.className = "legend" + timeStamp;

            for(var i=0; i<l; i++){
                color = series[i].color || defaultColors[i];
                html += '<span class="legend-color'+timeStamp+'" style="background-color:' + color + '"></span><span class="legend-name'+timeStamp+'">' + series[i].name + '</span>';
            }

            legend.innerHTML = html;
            this.innerContainer.appendChild(legend);
        },
        showIndicator : function(x, y, startIndex, isRefresh){
            var commonAttr = this.commonAttr,
                data = this.data;

            if(x < 0 || x >= commonAttr.containerWidth){
                return;
            }

            var interval = commonAttr.xInterval, posX, posY, halfStep = interval/2;
            var index = startIndex || parseInt(x/interval);

            index = Math.max(0, Math.min(this.seriesDataLength-1, index));//规定index范围

            if(this.indicatorLastIndex == index && !isRefresh){
                return;
            }else{
                this.indicatorLastIndex = index;
            }

            // 吸附
            var posX = index * interval + halfStep;

            this.indicator.style.left = posX-this.indicator.offsetWidth/2 + 'px';

            this.onShowIndicator && this.onShowIndicator(posX, index, isRefresh);
        },
        bindAction : function(element){
            var data = this.data,
                startX,
                startY,
                self = this;

            element.addEventListener('touchmove', function(e){
                e.stopPropagation();
                var touch = e.touches[0], container = this.parentNode;
                var x = touch.pageX - container.offsetLeft;
                var y = touch.pageY - container.offsetTop;

                var rate = Math.abs(y-startY)/Math.abs(x-startX);

                if(rate < 2){
                    e.preventDefault();
                    first = false;
                }
                self.showIndicator(x, y);
            });

            element.addEventListener('touchstart', function(e){
                e.stopPropagation();
                var touch = e.touches[0], container = this.parentNode;
                var x = touch.pageX - container.offsetLeft;
                var y = touch.pageY - container.offsetTop;

                startX = x;
                startY = y;

                self.showIndicator(x, y);
            });
        },
    });

    window.Charts.BLBase = BLBase;
})();