(function () {
    function _rgb2Hsv(rgb){
        var r = rgb[0] / 255;
        var g = rgb[1] / 255
        var b = rgb[2] / 255;
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

    /**
     * 颜色相似判断
     * @param {array} now 当前rgb数组
     * @param {array} former 原始rgb数组
     * @param {object} threshold 阈值对象
     */
    function isSimilar (now, former, threshold) {
        var huethrd = threshold.huethrd || 0.05,
            satthrd = threshold.satthrd || 0.5,
            valthrd = threshold.valthrd || 0.18;
        var hsv1 = _rgb2Hsv(now),
            hsv2 = _rgb2Hsv(former);
        if (Math.abs(hsv1[0] - hsv2[0]) < huethrd
            && Math.abs(hsv1[1] - hsv2[1]) < satthrd
            && Math.abs(hsv1[2] - hsv2[2]) < valthrd) {
            return true;
        }
        return false;
    }

    /**
     * 皮肤判断
     * @param {array} rgb rgb数组
     * @param {object} threshold 阈值对象
     */
    function isSkin(rgb, threshold) {
        var hsv = _rgb2Hsv(rgb);
        var huemin = threshold.huemin || 0,
            huemax = threshold.huemax || 0.06,
            satmin = threshold.satmin || 0.15,
            satmax = threshold.satmax || 1,
            valmin = threshold.valmin || 0.47,
            valmax = threshold.valmax || 1;
        if ((hsv[0] >= huemin && hsv[0] <= huemax)
            && (hsv[1] >= satmin && hsv[1] <= satmax)
            && (hsv[2] >= valmin && hsv[2] <= valmax)) {
            
            return true;
        }
        return false;
    }

    function rgbFilter(rgb, type) {
        var idx = 0;
        if (type === 'g') {
            idx = 1;
        }
        if (type === 'b') {
            idx = 2;
        }
        rgb[idx] = 255;
        return rgb;
    }

    window.ImgP = {
        isSkin: isSkin,
        isSimilar: isSimilar,
        rgbFilter: rgbFilter
    }
})();