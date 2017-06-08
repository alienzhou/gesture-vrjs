(function(){
    var socket = io();
    var gestureFunc;                            // 手势触发的方法
    var startDetect = true;                     // 是否开始手势轨迹检测（轨迹数据放至队列）
    var degArr = [];
    var activeIdx = 6;
    var viewing = false;

    for (var i = 0; i < 10; i++) {
        degArr[i] = i * 36;
    }

    socket.on('gesture', function (gtr) {
        if (getQuery('id') !== gtr.id) {
            return;
        }
        gestureFunc && gestureFunc(gtr.direction);
    });

    // 手势方法
    gestureFunc = function (direction) {
        var style = '';
        var step = 0;
        if (direction === 'none' || direction === '下') {
            return;
        }
        switch (direction) {
            case '左':
                step = 1;
                break;
            case '右':
                step = -1;
                break;
            case '上':
                break;
            default:
                return;
        }
        if (step === 0) {
            toggleImg();
            return;
        }
        if (!viewing) {
            rotate(step);
            return;
        }
    }

    function getQuery(key) {
        var search = window.location.search;
        var tmp;
        var val;
        if (search.length === 0) {
            return null;
        }
        searchArr = search.slice(1, search.length).split('&');
        for (var i = searchArr.length - 1; i >= 0; i--) {
            tmp = searchArr[i].split('=');
            if (tmp[0] === key) {
                val = tmp[1];
                break;
            }
        }
        return val;
    }

    function rotate(step) {
        var list = $('.piece');
        var style = '';
        var styleArr = [];
        $('#left-stage').children('img').each(function () {
            styleArr.push($(this).css('transform'));
        });
        if (step === -1) {
            var tmp = styleArr.pop();
            styleArr.unshift(tmp);
        }
        else if (step === 1) {
            var tmp = styleArr.shift();
            styleArr.push(tmp);
        }

        for (var i = 0, len = styleArr.length; i < len; i++) {
            $('#left-stage').children('img').eq(i).css({
                'transform': styleArr[i]
            });
            $('#right-stage').children('img').eq(i).css({
                'transform': styleArr[i]
            });
        }

        activeIdx = activeIdx - step;
        if (activeIdx < 0) {
            activeIdx = activeIdx + 10;
        }
        if (activeIdx > 9) {
            activeIdx = activeIdx - 10;
        }
        console.log(activeIdx)
    }

    function toggleImg() {
        if (!viewing) {
            showImg();
        }
        else {
            hideImg();
        }
    }

    function showImg() {
        var src = $('.left_eye').children('img').eq(activeIdx).attr('src');
        $('.show').children('img').attr('src', src);
        $('.show').animate({
            opacity: 1
        }, 100, 'linear');
        $('.show').children('img').animate({
            bottom: '15%'
        }, 100, 'linear');
        viewing = true;
    }

    function hideImg() {
        var finished = false;
        $('.show').animate({
            opacity: 0
        }, 120, 'linear');
        $('.show').children('img').animate({
            bottom: '30%'
        }, 120, 'linear', function () {
            $(this).css({
                bottom: '0%'
            });
            
            viewing = false;
        });
    }
})();