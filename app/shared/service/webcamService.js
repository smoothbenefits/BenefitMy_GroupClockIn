(function (){
    "use Strict";

    timeTrackingApp.factory("webcamService", function () {
        var webcam = {};
        webcam.isTurnOn = false;
        webcam.patData = null;
        var _video = null;
        var _stream = null;
        webcam.patOpts = {x: 0, y: 0, w: 25, h: 25};
        webcam.channel = {
            videoHeight: 800,
            videoWidth: 600
        };
        webcam.webcamError = false;

        var getVideoData = function getVideoData(x, y, w, h) {
            var hiddenCanvas = document.createElement("canvas");
            hiddenCanvas.width = _video.width;
            hiddenCanvas.height = _video.height;
            var ctx = hiddenCanvas.getContext("2d");
            ctx.drawImage(_video, 0, 0, _video.width, _video.height);
            return ctx.getImageData(x, y, w, h);
        };

        webcam.makeSnapshot = function(env) {
            var patCanvas = document.querySelector("#snapshot");
            if (!patCanvas) return;

            patCanvas.width = _video.width;
            patCanvas.height = _video.height;
            var ctxPat = patCanvas.getContext("2d");

            var idata = getVideoData(webcam.patOpts.x, webcam.patOpts.y, webcam.patOpts.w, webcam.patOpts.h);
            ctxPat.putImageData(idata, 0, 0);

            webcam.snapshotData = patCanvas.toDataURL("image/jpeg");

            webcam.patData = idata;

            webcam.showDialog(webcam.snapshotData);
        };

        webcam.onSuccess = function () {
            _video = webcam.channel.video;
            webcam.patOpts.w = _video.width;
            webcam.patOpts.h = _video.height;
            webcam.isTurnOn = true;
        };

        webcam.onStream = function (stream) {
            activeStream = stream;
            return activeStream;
        };

        webcam.onError = function (err) {
            webcam.webcamError = err;
        };

        webcam.turnOff = function () {
            webcam.isTurnOn = false;
            if (activeStream && activeStream.getVideoTracks) {
                var checker = typeof activeStream.getVideoTracks === "function";
                if (checker) {
                    return activeStream.getVideoTracks()[0].stop();
                }
                return false;
            }
            return false;
        };

        var service = {
            webcam: webcam
        };
        return service;

    });
})();