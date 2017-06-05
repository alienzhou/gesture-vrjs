(function(){
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var canvasPoint = document.getElementById('canvas-point');

    var height = 0;                             // 高度
    var width = 0;                              // 宽度
    var compression = 15;                       // 压缩度
    var realBgPix;                              // 实时背景像素（上一帧）
    var centerArr = [];                         // 中心点坐标
    var centerQuene = [];                       // 中心点队列
    var gestureFunc;                            // 手势触发的方法
    var startDetect = true;                     // 是否开始手势轨迹检测（轨迹数据放至队列）
    var rotate = {
        x: 0,
        y: 0,
        z: 0
    };
    var quene = {
        timer: undefined,                       // 队列循环器
        gap: $('#interval').val()               // 队列循环间隔
    }
    var simiThreshold = {
        huethrd: $('#huethrd').val(),
        satthrd: $('#satthrd').val(),
        valthrd: $('#valthrd').val()
    };
    var skinThreshold = {
        huemin: $('#huemin').val(),
        huemax: $('#huemax').val(),
        satmin: $('#satmin').val(),
        satmax: $('#satmax').val(),
        valmin: $('#valmin').val(),
        valmax: $('#valmax').val()
    };

    // 手势方法
    gestureFunc = function (direction) {
        var style = '';
        if (direction === 'none') {
            return;
        }
        switch (direction) {
            case '左':
                rotate.y -= 60;
                break;
            case '右':
                rotate.y += 60;
                break;
            default:
                break;
        }
        style = 'rotateY(' + rotate.y + 'deg)';
        $('.piece-box').css({
            'transform': style
        });
    }

    // 延时绘制
    delayCal();

    navigator.getUserMedia({
        audio: false,
        video: true
    }, function(stream) {
	    var _stream = stream;
        var _url = window.URL.createObjectURL(stream);
	    video.src = _url;
	    video.addEventListener('play', function() {
            $('#bg-pic').attr('src', _url);
            setInterval(dump, 1000 / 25);
        });
    }, function(){
	    throw new Error('don\'t support');
    });

    $('#setting-btn').on('click', function () {
        var fullpage = $(this).parent('div');
        if (fullpage.hasClass('full_page_show')) {
            $('#mask').removeClass('mask_show');
            fullpage.removeClass('full_page_show');
        }
        else {
            $('#mask').addClass('mask_show');
            fullpage.addClass('full_page_show');
        }
    });

    $('#mask').on('click', function () {
        $(this).removeClass('mask_show');
        $('#setting-btn').parent('div').removeClass('full_page_show');
    });

    $('#interval').on('change', function () {
        clearTimeout(quene.timer);
        quene.gap = $(this).val();
        // 延时绘制
        delayCal();
    });

    // VR开关
    $('input[name="model"]').on('change', function () {
        $('input[name="model"]').each(function () {
            $(this).removeAttr('checked');
        });
        $(this).attr('checked', 'checked');
        if (+$('input[name="model"][checked]').val() === 1) {
            $('#2d').hide();
            $('#3d').show();
        }
        else {
            $('#3d').hide();
            $('#2d').show();
        }
    });
    if (+$('input[name="model"][checked]').val() === 1) {
        $('#2d').hide();
        $('#3d').show();
    }
    else {
        $('#3d').hide();
        $('#2d').show();
    }

    function queneProcess() {
        var tmp = [];
        var moveArr = [];
        var flag = 0;
        var delt = 0;
        var i = 0;
        var direction = 'none';
        while (centerQuene.length > 0) {
            tmp = centerQuene.shift();
            if (flag >= 2) {
                break;
            }
            else if (tmp[0] === 0 && tmp[1] === 0) {
                flag += delt;
            }
            else {
                delt = 1;
                moveArr.push(tmp);
            }
            tmp = [];
            i++;
        }
        // 运动数组阈值判断（运动点个数，横移距离）
        if (moveArr.length > 2
                && Math.abs(moveArr[0][0] - moveArr[moveArr.length - 1][0]) > 10) {
            var angle = MCal.calAngle(moveArr[0], moveArr[moveArr.length - 1]);
            $('#smooth').text(angle);
            if (angle >= 315 || angle < 45) {
                direction = '右';
            }
            else if (angle >= 135 && angle < 225) {
                direction = '左';
            }
            // 设置手势检测的间隔。一个手势过后25ms开始下一次数据记录
            startDetect = false;
            setTimeout(function () {
                startDetect = true;
            }, 25);
        }
        else {
            $('#smooth').text('none');
        }
        $('#direction').text(direction);
        gestureFunc && gestureFunc(direction);
    }

    function delayCal() {
        queneProcess();
        quene.timer = setTimeout(delayCal, quene.gap);
    }

    function realCal(center) {
        $('#realtime').text(MCal.calAngle(lastCenter, center));
    }

    function dump(){
        simiThreshold = {
            huethrd: $('#huethrd').val(),
            satthrd: $('#satthrd').val(),
            valthrd: $('#valthrd').val()
        };
        skinThreshold = {
            huemin: $('#huemin').val(),
            huemax: $('#huemax').val(),
            satmin: $('#satmin').val(),
            satmax: $('#satmax').val(),
            valmin: $('#valmin').val(),
            valmax: $('#valmax').val()
        };

        // 将video模糊映射至canvas
	    if (canvas.width !== video.videoWidth){
		    width = Math.floor(video.videoWidth / compression);
		    height = Math.floor(video.videoHeight / compression);
		    canvas.width = width;
		    canvas.height = height;
	    }
	    canvas.getContext('2d').drawImage(video, 0, 0, width, height);

        // 保存原图像像素信息
	    var draw = canvas.getContext('2d').getImageData(0, 0, width, height);
        var pixData = fetchPixData(draw)

        if (realBgPix) {
            var center = filter(draw, pixData);
            // 抽象点绘制
            canvasPoint.width = width;
	        canvasPoint.height = height;
            drawCircle(center);
            // 放至队列
            if (startDetect) {
                centerQuene.push([center[0], center[1]]);
            }
        }
        else {
            console.log(draw.width);
            console.log(draw.height);
            console.log("===========");
        }

        realBgPix = new Uint8ClampedArray(pixData.length);
        pixData.forEach(function(ele, idx) {
            realBgPix[idx] = ele;
        });
    }

    function filter(imageData, origin) {
        var len = origin.length / 4;
        var rowNum = imageData.height;
        var colNum = imageData.width;
        var idxArr = [];
        var tmp = [];
        var sum = [0, 0];
        for (var i = 0; i < len; i++) {
            var now = [origin[4 * i + 0], origin[4 * i + 1], origin[4 * i + 2]];
            var former = [realBgPix[4 * i + 0], realBgPix[4 * i + 1], realBgPix[4 * i + 2]];
            // 皮肤与背景差过滤
            if (ImgP.isSkin(now, skinThreshold)
                && !ImgP.isSimilar(now, former, simiThreshold)) {
                imageData.data[4 * i + 0] = 255;
                imageData.data[4 * i + 1] = 255;
                imageData.data[4 * i + 2] = 255;
                imageData.data[4 * i + 3] = 200;
                // 存储序号值
                idxArr.push(i);
                // 计算中心点坐标和
                sum[0] += i % colNum;
                sum[1] += Math.floor(i / colNum);
            }
            else {
                imageData.data[4 * i + 0] = 0;
                imageData.data[4 * i + 1] = 0;
                imageData.data[4 * i + 2] = 0;
                imageData.data[4 * i + 3] = 255;
            }
        }
        // 噪声点过滤
        if (idxArr.length < $('#pix-amount').val()) {
            for (var i = 0, size = idxArr.length; i < size; i++) {
                imageData.data[4 * idxArr[i] + 0] = 0;
                imageData.data[4 * idxArr[i] + 1] = 0;
                imageData.data[4 * idxArr[i] + 2] = 0;
                imageData.data[4 * idxArr[i] + 3] = 255;
            }
            return [0, 0];
        }
        return [colNum - 1 - sum[0] / idxArr.length, sum[1] / idxArr.length];
    }

    function drawCircle(centerArr) {
        if (centerArr[0] === 0 && centerArr[1] === 0) {
            return;
        }
        var ctx = canvasPoint.getContext('2d');
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.arc(centerArr[0], centerArr[1], 1, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
        ctx.stroke();
        ctx.closePath();
    }

    function fetchPixData(imageData, type) {
        var len = imageData.data.length / 4;
        var tmp = new Uint8ClampedArray(len * 4);
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < 4; j++) {
                tmp[4 * i + j] = imageData.data[4 * i + j];
            }
        }
        return tmp;
    }
})();