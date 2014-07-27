fox.navigator.defaultTransition = 'hslide';
document.addEventListener('touchmove', function (e) {
    e.preventDefault();
}, false);/*防止ios页面滚动*/

window.addEventListener('HTMLImportsLoaded', function(e) {
    document.body.removeAttribute('unresolved');
});

$(function() {
    var isWrite = false;
    var storage = window.localStorage;
    var json_data = {
        id : null,
        star : true,
        text : null
    }
    var down_submit = function() {
        $('body').swipeDown(function() {
            if(isWrite) {
                $('.write-box').animate({'top' : '100%'}, 200, 'ease', function() {
                    $(this).css({'top' : '-150px'});
                    down_writeBox();
                    isWrite = false;
                    /*提交数据*/
                    var text = $('.write-text').val();
                    var wl_id = Math.random();
                    json_data.text = text;
                    json_data.star = false;
                    storage.setItem('wl_id', JSON.stringify(json_data));
                    var temp = '<li>' +
                        '<a href="" class="swipe-left">' +
                        '<div class="item-body">'+ text +'</div>' +
                        '</a>' +
                        '<div class="item-menu">' +
                        '<span class="star">标记</span><span class="delete b-red">删除</span>' +
                        '</div></li>';
                    $('ul.wl-list').prepend(temp);
                    $('.write-text').val('');

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
            }
        });

    };

    var down_writeBox = function() {
        $('body').off('swipeDown').off('swipeUp');
        $('body').swipeDown(function() {
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
    menuAction('delete',function() {
        alert("delete")
    });
    menuAction('star',function() {
        alert("star")
    });


});

