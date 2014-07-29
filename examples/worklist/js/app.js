window.addEventListener('HTMLImportsLoaded', function(e) {
    document.body.style.display = 'block';
});


$(function() {

    var storage = window.localStorage;
    var json_data = {
        star : true,
        text : null
    }

    var storage = window.localStorage;
    $("ul.wl-list").hide();
    var list = '';
    for(var i=0;i<storage.length;i++){
        if(JSON.parse(storage.getItem(storage.key(i))).star == true) {
            list = list + '<li>' +
                '<a href="#" class="swipe-left">' +
                '<div class="item-body">'+ JSON.parse(storage.getItem(storage.key(i))).text +'</div><div class="item-tail">' +
                '<span class="item-icon icon-star"></span></div>' +
                '</a>' +
                '<div class="item-menu" data-id="'+ storage.key(i) +'">' +
                '<span class="star">去星</span><span class="delete b-red">删除</span>' +
                '</div></li>';
        }else{
            list = list + '<li>' +
                '<a href="#" class="swipe-left">' +
                '<div class="item-body">'+ JSON.parse(storage.getItem(storage.key(i))).text +'</div><div class="item-tail hide">' +
                '<span class="item-icon icon-star"></span></div>' +
                '</a>' +
                '<div class="item-menu" data-id="'+ storage.key(i) +'">' +
                '<span class="star">标星</span><span class="delete b-red">删除</span>' +
                '</div></li>';
        }

    }
    $("ul.wl-list").html(list).fadeIn(function() {
        setTimeout("$('.welcome').fadeOut(300)", 1000);
    });

    var isWrite = false;
    var stopScroll = function (e) { e.preventDefault(); };
    var down_submit = function() {
        $('body').swipeDown(function() {
            if(isWrite) {
                $('.write-box').animate({'top' : '100%'}, 200, 'ease', function() {
                    $(this).css({'top' : '-150px'});
                    down_writeBox();
                    isWrite = false;
                    /*提交数据*/
                    var text = $('.write-text').val();
                    var wl_id = 'wl' + Math.random().toString();
                    json_data.star = false;
                    json_data.text = text;
                    storage.setItem(wl_id, JSON.stringify(json_data));
                    var temp = '<li>' +
                        '<a href="#" class="swipe-left">' +
                        '<div class="item-body">'+ text +'</div><div class="item-tail hide">' +
                        '<span class="item-icon icon-star"></span></div>' +
                        '</a>' +
                        '<div class="item-menu" data-id="'+ wl_id +'">' +
                        '<span class="star">标星</span><span class="delete b-red">删除</span>' +
                        '</div></li>';
                    $('ul.wl-list').prepend(temp);
                    $('.write-text').val('');
                    $('.mask').hide();
                    document.removeEventListener('touchmove', stopScroll, false);
                });
            }

        });
    };

    var up_cancel = function() {
        $('body').swipeUp(function() {
            if(isWrite) {
                $('.write-box').animate({'top':'-150px'}, 200, 'ease', function() {
                    down_writeBox();
                    isWrite = false;
                });
                $('.mask').hide();
                document.removeEventListener('touchmove', stopScroll, false);
            }
        });

    };

    var down_writeBox = function() {
        $('body').off('swipeDown').off('swipeUp');
        $('#plus-wl').tap(function() {
            $('.mask').fadeIn();
            document.addEventListener('touchmove', stopScroll, false);
            if(!isWrite) {
                $('.write-box').animate({'top':'0px'}, 200, 'ease', function() {
                    $('.write-text').focus();
                    isWrite = true;
                    up_cancel();
                    down_submit();
                });
            }
        });
    }

    down_writeBox();

    /*delete & star*/
    /*item-menu action*/
    menuAction = function(actionClassName, cb) {
        $('ul').tap(function(e) {
            var classNameArr = e.target.className.split(' ');
            var that = e.target;
            var L = classNameArr.length;
            for(var i = 0; i < L; i++) {
                if(classNameArr[i] == actionClassName) {
                    cb(that);  /*把被点击的按钮传过去*/
                }
            }
        });
    } /*调用 menuAction(className[string], callback);
     menuAction('delete',function() {
     alert("after tap the delete button")
     });
     */

    menuAction('delete',function(that) {
        var id = that.parentNode.getAttribute("data-id");
        storage.removeItem(id);
        var wl_item = that.parentNode.parentNode;
        wl_item.style.webkitTransform = 'translate3d(-100%, 0, 0)';
        wl_item.style.webkitTransition =  '300ms';
        var remove = function() {
            wl_item.style.display = 'none'
        }
        setTimeout(remove,300);
    });
    menuAction('star',function(that) {
        var id = that.parentNode.getAttribute("data-id");
        var json = JSON.parse(storage.getItem(id));
        if(json.star == true) {
            json.star = false;
            that.innerHTML = '标星';
            that.parentNode.previousSibling.lastChild.style.display = 'none';
        }else{
            json.star = true;
            that.innerHTML = '去星';
            that.parentNode.previousSibling.lastChild.style.display = 'block';
        }
        storage.setItem(id,JSON.stringify(json));

    });

    /*show item detail*/
    $('ul.wl-list').delegate('li', 'tap', function(e) {
        if(e.target.className == 'item-body') {
            var text = $(this).find('.item-body').text();
            if(text.length < 13) {
                $('.tap-toggle').show().children('p').css({'text-align':'center','text-indent':'0em'});
            }else{
                $('.tap-toggle').show().children('p').css({'text-align':'left','text-indent':'2em'});
            }
            $('.tap-toggle').show().children('p').html(text);
            $('.tap-toggle').tap(function() {
                $(this).addClass('show');
                if($(this).hasClass('show')) {
                    $(this).fadeOut(200);
                }
            });
        }
    });



});

