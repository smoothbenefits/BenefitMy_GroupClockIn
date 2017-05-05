(function() {
    "use strict";

    //ng-annotate
    timeTrackingApp.controller("WebcamCtrl", ["$scope", "$state", "$mdToast", "$mdDialog", "webcamService", "faceRecognitionService", "userModel", "timeTrackingService", "localStorageService", function ($scope, $state, $mdToast, $mdDialog, webcamService, faceRecognitionService, userModel, timeTrackingService, localStorageService) {
        $scope.status = userModel.isCurrentUserClockIn()? "out" : "in";
        $scope.username = userModel.getUserName();
        var lastStatus = localStorageService.get("lastStatus");
        if(lastStatus !== null && lastStatus.length >0) {
            var date = new Date(lastStatus[0].start);

            $scope.lastClockIn = "Your last Clock In time: " + date.toString("dddd, MMMM d, yyyy hh:mm tt");
        }

        $scope.channel = webcamService.webcam.channel;

        $scope.exitWebcam = function () {
            $state.go("pinLogin");
        };

        $scope.onSuccess = function() {
            webcamService.webcam.onSuccess();
            $scope.showButton = true;
            $scope.$apply(function() {
                $scope.showButton = true;
            });
        };

        $scope.onStream = webcamService.webcam.onStream;
        $scope.makeSnapshot = webcamService.webcam.makeSnapshot;


        $scope.onError = function() {
            $scope.$apply();

            webcamService.webcam.onError();
            //TODO we should display something if failed to load
            $mdToast.show(
                $mdToast.simple().content("Please reboot device!").theme("error-toast").hideDelay(8000)
            );
        };

        webcamService.webcam.showDialog = function(image) {
            DialogController.$inject = ["$scope", "image"];
            $mdDialog.show({
                controller: DialogController,
                templateUrl: "views/templates/confirmDialog.tmpl.html",
                parent: angular.element(document.body),
                clickOutsideToClose:false,
                fullscreen: true,
                locals : {
                    image : image
                }
            }).then(function(response) {
                if (response === true) {
                    if (userModel.isCurrentUserClockIn()) {
                        $mdToast.show($mdToast.simple().textContent("Thank you! " + userModel.getCurrentUserFisrtName() +"，you are Clock Out!")
                            .position("right"));
                    } else {
                        $mdToast.show($mdToast.simple().textContent("Thank you! " + userModel.getCurrentUserFisrtName() +", you are Clock In!")
                            .position("right"));
                    }

                    setTimeout(function() {
                        webcamService.webcam.turnOff();
                        $state.go("pinLogin");
                    }, 1500);
                } else {
                    //TODO failed to upload, we should request to server

                }
            }, function() {
                //choose to retake a picture
            });

            function DialogController($scope, image) {
                $scope.photo = image;
                $scope.cancel = function() {
                    $mdDialog.cancel();
                };

                $scope.answer = function(response) {
                    $mdDialog.hide(response);
                    // ga("send", {
                    //     hitType: "event",
                    //     eventCategory: "WebCam",
                    //     eventAction: "retake"
                    // });
                };

                $scope.upload = function() {
                    if(!userModel.hasGoldenPhoto()) {
                        faceRecognitionService.uploadGoldenPicture(image);
                        $mdDialog.hide(true);
                        return true;
                    }

                    faceRecognitionService.getRecognitionResult(image).then(function(data) {
                        console.log(data);
                        $mdDialog.hide(true);
                        timeTrackingService.punchTime(data);
                    }, function (error) {
                        //TODO we can request to server here, error to retrieve the result from AWS
                        //timeTrackingService.punchTime(image);
                        console.log(error);
                        $mdDialog.hide(false);
                    });
                };
            }
        };


    }]);
})();