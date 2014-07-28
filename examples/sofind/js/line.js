(function(){
    var Utils = Charts.Utils,
        BLBase = Charts.BLBase,
        defaultColors = Utils.defaultColors,
        addStyleSheets = Utils.addStyleSheets,
        timeStamp = Utils.timeStamp;

        addStyleSheets('.init-anim'  +timeStamp, 'transition:width 1s;-moz-transition:width 1s;-webkit-transition: width 1s;-o-transition:width 1s;');
        addStyleSheets('.round-hover'+timeStamp, 'background-repeat: no-repeat;position: absolute;width: 16px;height: 16px;border-radius: 100px;border: #3f9a41 3px solid;');
        addStyleSheets('.round-hover'+timeStamp+':before', 'display: block;content : "";border: #b7d3f0 2px solid;width: 6px;height: 6px;border-radius: 100px;margin: 3px;');
        addStyleSheets('.round-dot'  +timeStamp, 'position:absolute;border:#b7d3f0 2px solid;width:6px;height:6px;background:#e5f2ff;border-radius:100px;z-index:2');
        addStyleSheets('.round-min'  +timeStamp, 'position:absolute;border:#b7d3f0 2px solid;width:14px;height:14px;background:#e5f2fe;border-radius:100px;z-index:2');
        addStyleSheets('.round-max'  +timeStamp, 'position:absolute;border:#f2c4c1 2px solid;width:14px;height:14px;background:#fde5e3;border-radius:100px;z-index:2');
        addStyleSheets('.round-min'  +timeStamp+':before, .round-max'+timeStamp+':before', 'display: block;content : "";width: 10px;height: 10px;margin:2px;border-radius: 100px;');
        addStyleSheets('.round-min'  +timeStamp+':before', 'background: #3a82c9');
        addStyleSheets('.round-max'  +timeStamp+':before', 'background: #cd332d');
        addStyleSheets('.value-label'+timeStamp, 'position: absolute;text-align: center;font-size: 12px;color : #555;min-width:20px;white-space:nowrap;');
        addStyleSheets('.value-label'+timeStamp+'.min, .value-label'+timeStamp+'.max', 'font-size: 12px;color: #FFF;padding: 0px 7px;border-radius: 4px;');
        addStyleSheets('.value-label'+timeStamp+'.max', 'background: #d7372b;');
        addStyleSheets('.value-label'+timeStamp+'.min', 'background: #3d8ee0;');
        addStyleSheets('.value-label'+timeStamp+'.max .arrow-max', 'position: absolute;width: 0px;height: 0px;border-left: 5px solid transparent;border-right: 5px solid transparent;border-top: 5px solid #d7372b;');
        addStyleSheets('.value-label'+timeStamp+'.min .arrow-min', 'position: absolute;width: 0px;height: 0px;border-left: 5px solid transparent;border-right: 5px solid transparent;border-bottom: 5px solid #3d8ee0;');
        addStyleSheets('.indicator'  +timeStamp, 'position:absolute;width: 0;height: 100%;border-left: #7cbb7e 1px dashed;border-right: #7cbb7e 1px dashed;');
        addStyleSheets('.elements-container'+timeStamp, 'position:absolute;left:0;top:0;width:100%;height:100%;');
        addStyleSheets('.plot-container'+timeStamp, 'position:absolute;overflow:hidden;width:0;left:-10px;top:-10px;');
        addStyleSheets('.guide'+timeStamp, 'position:absolute;top:1px;opacity:0.5;border-top: 8px solid transparent;border-bottom: 8px solid transparent;-webkit-animation: guide 0.8s infinite');


    var Line = function(data){
        if(!data.container) return;

        this.setBaseProperties(data);

        this.plot = Utils.C('canvas');
        this.plotContainer = null;
        this.indicator = Utils.C('div');
        this.elementsContainer = Utils.C('div');//圆点、标签等
        this.hoverRounds = [];
        this.indicatorLastIndex = null;

        this.tmpELement;

        this.refresh();
    }

    Line.prototype = new BLBase();

    Line.prototype = Utils.mergeObj(Line.prototype, {
        refresh : function(data){
            var data = data || this.data;

            this.clear();
            this.setBaseComponents();
            this.setComponents();

            this.initAnim();//生成动画

            if(data.onhover && data.onhover.callback){
                this.bindAction(this.elementsContainer);
                var start = data.onhover.start === undefined? 10000 : data.onhover.start;
                var index = this.indicatorLastIndex === null ? start : this.indicatorLastIndex;
                this.showIndicator(0, 0, index, true);
            }
        },
        setComponents : function(){
            var data = this.data;
            // 折线容器
            var plotContainer = this.plotContainer = Utils.createEle('div', {
                height: this.commonAttr.containerHeight+20+'px',
            }, 'plot-container'+timeStamp);

            // 折线画布
            this.plotCTX = this.addCanvas(this.plot, plotContainer, this);
            Utils.setStyle(this.plot, {
                left : "0",
                top : "0"
            });

            this.innerContainer.appendChild(plotContainer);

            this.elementsContainer.className = "elements-container"+timeStamp;
            this.elementsContainer.appendChild(this.indicator);
            this.innerContainer.appendChild(this.elementsContainer);
            // 生成动画
            if(data.initAnim) plotContainer.className += ' init-anim'+timeStamp;
            // 画折线
            this.renderPlots();
            if(data.series.length > 1) renderLegend(container, data);


            // 指示线
            this.addHoverRound();
            this.indicator.className = 'indicator'+timeStamp;
            Utils.setStyle(this.indicator, data.indicator||{});  
        },
        moveIndicator : function(param){
            if('moveTo' in param){
                showIndicator(0, 0, param.moveTo);
            }else if('moveBy'in param){
                showIndicator(0, 0, components.indicatorLastIndex + param.moveBy);
            }
        },
        addHoverRound : function(){
            var data = this.data;
            var l = data.series.length;
            var tmp;
            for(var i = 0; i < l; i++) {
                tmp = Utils.createEle('div', {
                    // display : "none",
                    "z-index" : "1"
                }, data.roundDot&&data.roundDot.hover?'':"round-hover"+timeStamp);
                if(i == 0 && data.guide){
                    var border = 'right', pos = 'left';
                    if(data.onhover && data.onhover.start < this.seriesDataLength-1){
                        border = 'left';
                        pos = 'right';
                    }
                    Utils.addStyleSheets('@-webkit-keyframes guide', '0%{'+pos+':-12px;opacity:0;}100%{'+pos+':-18px;opacity:0.8;}');
                    tmp.innerHTML = '<div class="guide'+timeStamp+'" style="border-'+border+': 8px solid rgb(63, 154, 65);"></div>';
                }
                this.hoverRounds.push(tmp);
                this.elementsContainer.appendChild(tmp);
            }
        },
        setMostLabelStyle : function(style, label, x, y){
            var s = Utils.mergeObj(style, label);
            s.left = x - parseInt(label.width)/2 + 'px';
            return s;
        },
        putValueLabel : function(value, x, y, type){
            var commonAttr = this.commonAttr,
                data = this.data,
                content = value,
                arrow = '',
                className = 'value-label'+timeStamp+' ' + type;

            if(!this.tmpELement){
                this.tmpELement = Utils.C('div');
                document.body.appendChild(this.tmpELement);
            }
            var tmpELement = this.tmpELement;
            tmpELement.className = className;
            
            tmpELement.innerHTML = content;
            tmpELement.style.display = 'block';
            // tmpELement.style.lineHeight = '20px';
            var width = tmpELement.offsetWidth;
            var height = tmpELement.offsetHeight;
            var arrowX = tmpELement.clientWidth/2-5;
            var arrowY = tmpELement.clientHeight;
            tmpELement.style.display = 'none';

            var deltaH = 0;
            if(type == 'above' || type == 'max'){
                deltaH = - height;
            }

            var halfWidth = width/2, arrowTmp = 0, adjust = 3;
            var leftPos = halfWidth;
            if(x < halfWidth){
                leftPos = -adjust;
                arrowTmp = x - halfWidth + adjust;
            }else if(commonAttr.containerWidth - x < halfWidth){
                leftPos = commonAttr.containerWidth - width + adjust;
                arrowTmp = x - (commonAttr.containerWidth - halfWidth) - adjust;
            }else{
                leftPos = x - halfWidth;
            }

            if((type == "min" && !(data.valueLabel && data.valueLabel.min)) || (type == "max" && !(data.valueLabel && data.valueLabel.max))){
                var h = type == "min" ? "top" : "bottom";
                content += '<div class="arrow-' + type + '" style="left:' + (arrowX + arrowTmp) + 'px;' + h + ':-4px;"></div>';
            }

            var style = {
                position: 'absolute',
                top: y + deltaH + 'px',
                left: leftPos + 'px',
                "z-index" : "3"
            };

            /*
            if(type == "min" && data.valueLabel && data.valueLabel.min){
                            style = setMostLabelStyle(style, data.valueLabel.min, x, y);
                            className = '';
                        }else if(type == "max" && data.valueLabel && data.valueLabel.max){
                            style = setMostLabelStyle(style, data.valueLabel.max, x, y);
                            className = '';
                        }else if(data.valueLabel && data.valueLabel.label){
                            style = setMostLabelStyle(style, data.valueLabel.label, x, y);
                            className = '';
                        }*/
            

            var div = Utils.createEle('div', style, className, content);

            return div;
        },
        setDotStyle : function(dot){
            return Utils.mergeObj({position : 'absolute', 'z-index' : 2}, dot);
        },
        setMostValueDotObj : function(dotObj, mostType){
            var data = this.data;
            !dotObj ? (dotObj = Utils.C('div')) : dotObj.style.cssText = '';
            if(data.roundDot && data.roundDot[mostType]){
                Utils.setStyle(dotObj, this.setDotStyle(data.roundDot[mostType]));
            }else{
                dotObj.className = 'round-' + mostType+timeStamp;
            }
            
            return dotObj;
        },
        renderRoundDot : function(val, pX, pY, lastMost){
            var commonAttr = this.commonAttr, data = this.data;
            var roundDot = data.roundDot;
            var type = (roundDot && roundDot.type) || 'x', most = roundDot && roundDot.most || 'both', dotObj = null;
            var w = h = 0;
            if(type == 'all' || (type == 'x' && onStep)){
                var dot = roundDot && roundDot.dot;
                if(dot){
                    dotObj = Utils.createEle('div', setDotStyle(dot));
                }else{
                    dotObj = Utils.createEle('div', {}, 'round-dot'+timeStamp);
                }
            }

            if((most == 'min' || most == 'both') && val == commonAttr.min && lastMost == 'min'){
                dotObj = this.setMostValueDotObj(dotObj, 'min');
            }else if((most == 'max' || most == 'both') && val == commonAttr.max && lastMost == 'max'){
                dotObj = this.setMostValueDotObj(dotObj, 'max');
            }

            if(dotObj){
                this.elementsContainer.appendChild(dotObj);
                w = dotObj.offsetWidth;
                h = dotObj.offsetHeight;
                Utils.setStyle(dotObj, {
                    left : pX-w/2 +'px',
                    top : pY-h/2 +'px'
                });
            }
        },
        renderLabel : function(val, pX, pY, pos, lastMost){
            var commonAttr = this.commonAttr, data = this.data;
            var valueLabel = data.valueLabel;
            var type = valueLabel && valueLabel.type || 'all';
            var most = valueLabel && valueLabel.most || 'both';
            if(type){
                var lbl;
                var halfRound = h/2;
                if(type == 'all' || (type == 'x' && onStep)){
                    if(pos){//above
                        lbl = this.putValueLabel(val, pX, pY-halfRound, 'above');
                    }else{//below
                        lbl = this.putValueLabel(val, pX, pY+halfRound, 'below');
                    }
                }

                if((most == 'min' || most == 'both') && val == commonAttr.min && lastMost == 'min'){
                    lbl = this.putValueLabel(val, pX, pY+halfRound+5, 'min');
                }else if((most == 'max' || most == 'both') && val == commonAttr.max && lastMost == 'max'){
                    lbl = this.putValueLabel(val, pX, pY-halfRound-5, 'max');
                }

                lbl && this.elementsContainer.appendChild(lbl);
            }
        },
        isLastMost : function(val, arr, i){
            if(val == this.commonAttr.min){
                for (var j = i+1; j < arr.length; j++) {
                    if(arr[j] == val) return null;
                }
                return 'min';
            }

            if(val == this.commonAttr.max){
                for (var j = i+1; j < arr.length; j++) {
                    if(arr[j] == val) return null;
                }
                return 'max';
            }
        },
        renderPlots : function(){
            var commonAttr = this.commonAttr,
                data = this.data,
                plotCTX = this.plotCTX,
                series = data.series,
                serie,
                YArr,
                yAxis = commonAttr.yAxis,
                PI = Math.PI*2,
                step = data.xAxis.step;

            for(var i = 0; i < series.length; i++){
                serie = series[i];
                plotCTX.beginPath();

                YArr = yAxis[i];

                // 折线
                plotCTX.moveTo(commonAttr.xAxis[0]*2, (commonAttr.containerHeight-YArr[0])*2);
                var l = this.seriesDataLength;
                for(var j = 0; j < l; j++){
                    if(j > 0){
                        this.plotCTX.lineTo(commonAttr.xAxis[j]*2, (commonAttr.containerHeight-YArr[j])*2);
                    }

                    var onStep = this.isOnStep(step, j, l);
                    var pX = commonAttr.xAxis[j], pY = commonAttr.containerHeight-YArr[j];
                    val = serie.data[j];
                    var tmp = this.isLastMost(val, serie.data, j);
                    // 圆点
                    this.renderRoundDot(val, pX, pY, tmp);

                    // 值标签
                    pos = (j==0 || val >= serie.data[j-1]);
                    this.renderLabel(val, pX, pY, pos, tmp);

                }
                plotCTX.strokeStyle = serie.color || defaultColors[i];
                plotCTX.lineWidth = 4; 
                plotCTX.stroke();

                // 渐变颜色
                plotCTX.lineTo(commonAttr.xAxis[j-1]*2, commonAttr.containerHeight*2);
                plotCTX.lineTo(commonAttr.xInterval, commonAttr.containerHeight*2);
                plotCTX.closePath();
                plotCTX.save();
                var gradient = plotCTX.createLinearGradient(0, 0, 0, commonAttr.containerHeight);   //创建一个线性渐变
                gradient.addColorStop(0.3, "rgba(216,235,255,0.4)");
                gradient.addColorStop(1, "rgba(244,249,255,0.4)");
                plotCTX.fillStyle = gradient;
                plotCTX.fill();
                plotCTX.restore();
            }
        },
        onShowIndicator : function(posX, index, isRefresh){
            var commonAttr = this.commonAttr,
                data = this.data;

            if(data.guide && !this.showedGuide && !isRefresh){
                this.showedGuide = true;
            }

            if(this.showedGuide){
                this.hoverRounds[0].innerHTML = '';
            }
            // posY
            var l = commonAttr.yAxis.length;
            var yValArr = [];
            var round, hoverRounds = this.hoverRounds;;
            if(data.roundDot && data.roundDot.hover){
                var hover = data.roundDot.hover;
                var w = parseInt(hover.width), h = parseInt(hover.height);
                for(var j = 0; j < l; j++) {
                    round = hoverRounds[j];
                    yValArr.push({
                        name : data.series[j].name,
                        data : data.series[j].data[index]
                    });
                    Utils.setStyle(round, Utils.mergeObj({
                        position : 'absolute',
                        top : (commonAttr.containerHeight-commonAttr.yAxis[j][index])-h/2 + 'px',
                        left : posX-w/2 + 'px'
                    }, hover));
                }
            }else{
                for(var j = 0; j < l; j++) {
                    round = hoverRounds[j];
                    yValArr.push({
                        name : data.series[j].name,
                        data : data.series[j].data[index]
                    });
                    Utils.setStyle(round, {
                        position : "absolute",
                        top : commonAttr.containerHeight-commonAttr.yAxis[j][index]-round.offsetHeight/2 + 'px',
                        left : posX-round.offsetWidth/2 + 'px',
                        backgroundColor : '#FFF'
                    });
                }
            }


            var xVal = data.xAxis.categories[index];

            commonAttr.hoverVal = {x: xVal, yArr : yValArr};
            // 回调
            data.onhover && data.onhover.callback && data.onhover.callback(xVal, yValArr);
        },

        initAnim : function(){
            this.plotContainer.style.width = this.commonAttr.containerWidth+20+'px';
        },

        clear : function(){
            this.container.innerHTML = '';
            this.plotContainer && (this.plotContainer.innerHTML = '');
            this.elementsContainer && (this.elementsContainer.innerHTML = '');
            this.hoverRounds = [];
        }
    });


    window.Charts.Line = Line;
})();