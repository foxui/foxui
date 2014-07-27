fox.navigator.defaultTransition = 'hslide';
document.addEventListener('touchmove', function (e) { e.preventDefault(); }, false);/*防止ios页面滚动*/

window.addEventListener('HTMLImportsLoaded', function(e) {
    document.body.removeAttribute('unresolved');
});

$(function() {
    var isWrite = false;
    var down_submit = function() {
        $('body').swipeDown(function() {
            if(isWrite) {
                $('.write-box').animate({'top' : '100%'}, 200, 'ease', function() {
                    $(this).css({'top' : '-150px'});
                    down_writeBox();
                    isWrite = false;
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



});

