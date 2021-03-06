(function(){
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var canvasBg = document.getElementById('canvas-bg');
    var canvasSkin = document.getElementById('canvas-skin');
    var canvasBgfilter = document.getElementById('canvas-bgfilter');
    var canvasPoint = document.getElementById('canvas-point');

    var height = 0;                             // 高度
    var width = 0;                              // 宽度
    var compression = 15;                       // 压缩度
    var realBgPix;                              // 实时背景像素（上一帧）
    var centerArr = [];                         // 中心点坐标
    var lastCenter = [-1, -1];                  // 上一帧中心点
    var centerQuene = [];                       // 中心点队列
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

    $('#similar-ctrl').on('click', function () {
        console.table([simiThreshold]);
        console.table(centerQuene);
    });
    $('#skin-ctrl').on('click', function () {
        console.table([skinThreshold]);
    });
    $('#interval').on('change', function () {
        clearTimeout(quene.timer);
        quene.gap = $(this).val();
        // 延时绘制
        delayCal();
    })

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
                //console.log(111)
                break;
            }
            else if (tmp[0] === 0 && tmp[1] === 0) {
                //console.log("flag: " +flag)
                flag += delt;
            }
            else {
                //console.log(333)
                delt = 1;
                moveArr.push(tmp);
            }
            tmp = [];
            i++;
        }
        if (moveArr.length > 2) {
            var angle = MCal.calAngle(moveArr[0], moveArr[moveArr.length - 1]);
            $('#smooth').text(angle);
            if (angle >= 315 || angle < 45) {
                direction = '右';
            }
            else if (angle >= 45 && angle < 135) {
                direction = '上';
            }
            else if (angle >= 135 && angle < 225) {
                direction = '左';
            }
            else {
                direction = '下';
            }
        }
        else {
            $('#smooth').text('none');
        }
        $('#direction').text(direction);
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

        // 皮肤过滤
        canvasSkin.width = width;
	    canvasSkin.height = height;
        skinFilter(draw, pixData);
        canvasSkin.getContext('2d').putImageData(draw, 0, 0);

        if (realBgPix) {
             // 背景差过滤
            canvasBgfilter.width = width;
	        canvasBgfilter.height = height;
            var center = filter(draw, pixData);
            canvasBgfilter.getContext('2d').putImageData(draw, 0, 0);

            // 抽象点绘制
            canvasPoint.width = width;
	        canvasPoint.height = height;
            drawCircle(center);

            // 放至队列
            centerQuene.push([center[0], center[1]]);
            // 实时绘制
            realCal(center);
            // 更新前一个中心点
            lastCenter[0] = center[0];
            lastCenter[1] = center[1];
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

    function skinFilter(imageData, origin) {
        var len = origin.length / 4;
        var tmp;
        for (var i = 0; i < len; i++) {
            var now = [origin[4 * i + 0], origin[4 * i + 1], origin[4 * i + 2]];
            if (!ImgP.isSkin(now, skinThreshold)) {
                imageData.data[4 * i + 0] = 0;
                imageData.data[4 * i + 1] = 0;
                imageData.data[4 * i + 2] = 0;
            }
        }
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