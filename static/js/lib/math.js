(function () {
    function calAngle(from, to) {
        var x = to[0] - from[0];
        var y = to[1] - from[1];
        var z = Math.sqrt(x * x + y * y);
        var angle = Math.floor(180 / (Math.PI / Math.acos(x / z)));
        if (y > 0) {
            angle = 360 - angle;
        }
        return angle;
    }

    window.MCal = {
        calAngle: calAngle
    }
})();