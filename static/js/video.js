(function(){
    var video = document.getElementById('video');
    var canvas = document.getElementById('canvas');
    var canvasBg = document.getElementById('canvas-bg');
    var canvasFilter = document.getElementById('canvas-filter');
    var canvasSkin = document.getElementById('canvas-skin');
    var canvasBgfilter = document.getElementById('canvas-bgfilter');
    var canvasPoint = document.getElementById('canvas-point');

    var context = canvas.getContext('2d');
    var height = 0;
    var width = 0;
    var compression = 15;
    var firstPaint = true;
    var bgPix;
    var realBgPix;

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

    $('#bg-ctrl').on('click', function() {
        generateBg();
    });
    $('#similar-ctrl').on('click', function() {
        var obj = [{
            huethrd: $('#huethrd').val(),
            satthrd: $('#satthrd').val(),
            valthrd: $('#valthrd').val()
        }];
        console.table(obj);
    });
    $('#skin-ctrl').on('click', function() {
        var obj = [{
            huemin: $('#huemin').val(),
            huemax: $('#huemax').val(),
            satmin: $('#satmin').val(),
            satmax: $('#satmax').val(),
            valmin: $('#valmin').val(),
            valmax: $('#valmax').val()
        }];
        console.table(obj);
    });

    function generateBg() {
        canvasBg.width = width;
	    canvasBg.height = height;
        canvasBg.getContext('2d').drawImage(canvas, 0, 0);
        var tmp = canvasBg.getContext('2d').getImageData(0, 0, width, height).data;

        bgPix = new Uint8ClampedArray(tmp.length);
        tmp.forEach(function(ele, idx) {
            bgPix[idx] = ele;
        });
    }

    function dump(){
	    if (canvas.width !== video.videoWidth){
		    width = Math.floor(video.videoWidth / compression);
		    height = Math.floor(video.videoHeight / compression);
		    canvas.width = width;
		    canvas.height = height;
	    }
	    context.drawImage(video, 0, 0, width, height);

	    var draw = context.getImageData(0, 0, width, height);
        var pixData = fetchPixData(draw)

        canvasSkin.width = width;
	    canvasSkin.height = height;
        filterSkin(draw, pixData);
        canvasSkin.getContext('2d').putImageData(draw, 0, 0);

        if (bgPix) {
            canvasFilter.width = width;
	        canvasFilter.height = height;
            filterBg(draw, pixData);
            canvasFilter.getContext('2d').putImageData(draw, 0, 0);
        }

        if (realBgPix) {
            canvasBgfilter.width = width;
	        canvasBgfilter.height = height;
            filterDynamicBg(draw, pixData);
            canvasBgfilter.getContext('2d').putImageData(draw, 0, 0);

            canvasPoint.width = width;
	        canvasPoint.height = height;
            // canvasPoint.getContext('2d').putImageData(draw, 0, 0);
            drawCircle(point(draw));
        }

        if (firstPaint) {
            firstPaint = !firstPaint;
            setTimeout(generateBg, 1000);
        }

        realBgPix = new Uint8ClampedArray(pixData.length);
        pixData.forEach(function(ele, idx) {
            realBgPix[idx] = ele;
        });
    }

    function drawCircle(centerArr) {
        if (centerArr[0] === 0 && centerArr[1] === 0) {
            return;
        }
        var ctx = canvasPoint.getContext('2d');
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 5;
        ctx.arc(centerArr[1], centerArr[0], 1, (Math.PI / 180) * 0, (Math.PI / 180) * 360, false);
        ctx.stroke();
        ctx.closePath();
    }

    function point(imageData) {
        var len = imageData.data.length / 4;
        var row = imageData.height;
        var col = imageData.width;
        var tmp = [];
        var sum = [0, 0];
        for (var i = 0; i < len; i++) {
            if (imageData.data[4 * i + 0] === 255) {
                tmp.push([Math.floor(i / col), i % col]);
            }
        }
        if (tmp.length < $('#pix-amount').val()) {
            return sum;
        }
        tmp.forEach(function(ele, idx) {
            sum[0] += ele[0];
            sum[1] += ele[1];
        });
        return [sum[0] / tmp.length, sum[1] / tmp.length];
    }

    function maskData(imageData, origin, type) {
        var idx = 0;
        if (type === 'g') {
            idx = 1;
        }
        if (type === 'b') {
            idx = 2;
        }
        var len = origin.length / 4;
        for (var i = 0; i < len; i++) {
            for (var j = 0; j < 4; j++) {
                if (j === idx) {
                    imageData.data[4 * i + j] = 255;
                }
                else {
                    imageData.data[4 * i + j] = origin[4 * i + j];
                }
            }
            imageData.data[4 * i + 3] = 200;
        }
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

    function filterDynamicBg(imageData, origin) {
        var len = origin.length / 4;
        for (var i = 0; i < len; i++) {
            if (similarColor(
                    [origin[4 * i + 0], origin[4 * i + 1], origin[4 * i + 2]],
                    [realBgPix[4 * i + 0], realBgPix[4 * i + 1], realBgPix[4 * i + 2]])) {
                imageData.data[4 * i + 0] = 0;
                imageData.data[4 * i + 1] = 0;
                imageData.data[4 * i + 2] = 0;
                imageData.data[4 * i + 3] = 255;
            }
            else if(isSkin(origin[4 * i + 0], origin[4 * i + 1], origin[4 * i + 2])) {
                imageData.data[4 * i + 0] = 255;
                imageData.data[4 * i + 1] = 255;
                imageData.data[4 * i + 2] = 255;
                imageData.data[4 * i + 3] = 200;
            }
            else {
                imageData.data[4 * i + 0] = 0;
                imageData.data[4 * i + 1] = 0;
                imageData.data[4 * i + 2] = 0;
                imageData.data[4 * i + 3] = 255;
            }
        }
    }

    function filterBg(imageData, origin) {
        var len = origin.length / 4;
        for (var i = 0; i < len; i++) {
            if (similarColor(
                    [origin[4 * i + 0], origin[4 * i + 1], origin[4 * i + 2]],
                    [bgPix[4 * i + 0], bgPix[4 * i + 1], bgPix[4 * i + 2]])) {
                imageData.data[4 * i + 0] = 0;
                imageData.data[4 * i + 1] = 0;
                imageData.data[4 * i + 2] = 0;
                imageData.data[4 * i + 3] = 255;
            }
            else if(isSkin(origin[4 * i + 0], origin[4 * i + 1], origin[4 * i + 2])) {
                imageData.data[4 * i + 0] = 255;
                imageData.data[4 * i + 1] = 255;
                imageData.data[4 * i + 2] = 255;
                imageData.data[4 * i + 3] = 255;
            }
            else {
                imageData.data[4 * i + 0] = 0;
                imageData.data[4 * i + 1] = 0;
                imageData.data[4 * i + 2] = 0;
                imageData.data[4 * i + 3] = 255;
            }
        }
    }

    function postData(imageData, origin) {
        var len = origin.length / 4;
        for (var i = 0; i < len; i++) {
            imageData.data[4 * i + 0] = origin[4 * i + 0] & 0xe0;
            imageData.data[4 * i + 1] = origin[4 * i + 1] & 0xe0;
            imageData.data[4 * i + 2] = origin[4 * i + 2] & 0xe0;
            imageData.data[4 * i + 3] = 255;
        }
    }

    function filterSkin(imageData, origin) {
        var len = origin.length / 4;
        var tmp;
        for (var i = 0; i < len; i++) {
            tmp = matchSkin(origin[4 * i + 0], origin[4 * i + 1], origin[4 * i + 2]);
            imageData.data[4 * i + 0] = tmp[0];
            imageData.data[4 * i + 1] = tmp[1];
            imageData.data[4 * i + 2] = tmp[2];
            tmp = [];
        }
    }

    function isSkin(r, g, b) {
        var hsv = rgb2Hsv(r, g, b);
        var huemin = $('#huemin').val(),
            huemax = $('#huemax').val(),
            satmin = $('#satmin').val(),
            satmax = $('#satmax').val(),
            valmin = $('#valmin').val(),
            valmax = $('#valmax').val();
        if ((hsv[0] >= huemin && hsv[0] <= huemax)
            && (hsv[1] >= satmin && hsv[1] <= satmax)
            && (hsv[2] >= valmin && hsv[2] <= valmax)) {
            return true;
        }
        return false;
    }

    function matchSkin(r, g, b) {
        var hsv = rgb2Hsv(r, g, b);
        var huemin = $('#huemin').val(),
            huemax = $('#huemax').val(),
            satmin = $('#satmin').val(),
            satmax = $('#satmax').val(),
            valmin = $('#valmin').val(),
            valmax = $('#valmax').val();
        if ((hsv[0] >= huemin && hsv[0] <= huemax)
            && (hsv[1] >= satmin && hsv[1] <= satmax)
            && (hsv[2] >= valmin && hsv[2] <= valmax)) {
            return [r, g, b];
        }
        else {
            return [0, 0, 0];
        }
    }

    function similarColor (rgb1, rgb2) {
        var huethrd = $('#huethrd').val(),
            satthrd = $('#satthrd').val(),
            valthrd = $('#valthrd').val();
        var hsv1 = rgb2Hsv(rgb1[0], rgb1[1], rgb1[2]),
            hsv2 = rgb2Hsv(rgb2[0], rgb2[1], rgb2[2]);
        if (Math.abs(hsv1[0] - hsv2[0]) < huethrd
            && Math.abs(hsv1[1] - hsv2[1]) < satthrd
            && Math.abs(hsv1[2] - hsv2[2]) < valthrd) {
            return true;
        }
        return false;
    }

    function rgb2Hsv(r, g, b){
        r = r/255
        g = g/255
        b = b/255;
        var max = Math.max(r, g, b)
        var min = Math.min(r, g, b);
        var h, s, v = max;
        var d = max - min;
        s = max === 0 ? 0 : d / max;
        if (max === min){
            h = 0;
        }
        else {
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
    	    }
   		    h /= 6;
   	    }
        return [h, s, v];
    }
})();