(function () {
    "use strict";

    //ng-annotate
    timeTrackingApp.controller("WebcamCtrl", ["$scope", "$state", "$mdToast", "$mdDialog", "webcamService", "faceRecognitionService", "userModel", "timeTrackingService", "localStorageService", function ($scope, $state, $mdToast, $mdDialog, webcamService, faceRecognitionService, userModel, timeTrackingService, localStorageService, blockUI) {
        $scope.status = userModel.isCurrentUserClockIn() ? "out" : "in";
        $scope.username = userModel.getUserName();
        var lastStatus = localStorageService.get("lastStatus");
        if (lastStatus !== null && lastStatus.length > 0) {
            var date = new Date(lastStatus[0].start);

            $scope.lastClockIn = "Your last Clock In time: " + date.toString("dddd, MMMM d, yyyy hh:mm tt");
        }

        $scope.channel = webcamService.webcam.channel;

        $scope.exitWebcam = function () {
            $state.go("pinLogin");
        };

        $scope.onSuccess = function () {
            webcamService.webcam.onSuccess();
            $scope.showButton = true;
            $scope.$apply(function () {
                $scope.showButton = true;
            });
        };

        $scope.onStream = webcamService.webcam.onStream;
        $scope.makeSnapshot = webcamService.webcam.makeSnapshot;


        $scope.onError = function () {
            $scope.$apply();

            webcamService.webcam.onError();
            //TODO we should display something if failed to load
            $mdToast.show(
                $mdToast.simple().content("Please reboot device!").theme("error-toast").hideDelay(8000)
            );
        };

        webcamService.webcam.showDialog = function (image) {
            DialogController.$inject = ["$scope", "image", "blockUI"];
            $mdDialog.show({
                controller: DialogController,
                templateUrl: "app/components/templates/confirmDialog.tmpl.html",
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                fullscreen: true,
                locals: {
                    image: image
                }
            }).then(function (response) {
                if (response === true) {
                    var displayMessage = "";
                    if (userModel.isCurrentUserClockIn()) {
                        displayMessage = "Thank you! " + userModel.getCurrentUserFisrtName() + "，you are Clock Out!";
                    } else {
                        displayMessage = "Thank you! " + userModel.getCurrentUserFisrtName() + ", you are Clock In!";
                    }

                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title("Confirm Message")
                            .textContent(displayMessage)
                            .ariaLabel(displayMessage)
                            .ok('Okay!')
                    ).finally(function () {
                        //clear user last status
                        localStorageService.set("lastStatus", null);
                        webcamService.webcam.turnOff();
                        $state.go("pinLogin");
                    });
                } else if (response === false) {
                    //something bad happens
                    var errorMessage = "Unable to upload photo, please contact HR!";

                    $mdDialog.show(
                        $mdDialog.alert()
                            .clickOutsideToClose(true)
                            .title("Error")
                            .textContent(errorMessage)
                            .ariaLabel(errorMessage)
                            .ok('Okay!')
                    ).finally(function () {
                        webcamService.webcam.turnOff();
                        $state.go("pinLogin");
                    });
                }
            }, function () {
                //choose to retake a picture
            });

            function DialogController($scope, image, blockUI) {
                $scope.dialog_status = userModel.isCurrentUserClockIn() ? "out" : "in";
                $scope.photo = image;
                $scope.cancel = function () {
                    $mdDialog.cancel();
                };

                $scope.answer = function (response) {
                    $mdDialog.cancel();
                    // ga("send", {
                    //     hitType: "event",
                    //     eventCategory: "WebCam",
                    //     eventAction: "retake"
                    // });
                };

                $scope.upload = function () {
                    blockUI.start();

                    if (!userModel.hasGoldenPhoto()) {
                        faceRecognitionService.uploadGoldenPicture(image).then(function (data) {
                            blockUI.stop();
                            console.log(data);
                            $mdDialog.hide(true);
                            timeTrackingService.punchTime(data);
                        }, function (error) {
                            blockUI.stop();
                            // Error to upload to S3 or failed to update profile
                            console.log(error);
                            $mdDialog.hide(false);
                        });
                        return true;
                    }

                    faceRecognitionService.getRecognitionResult(image).then(function (data) {
                        blockUI.stop();
                        //regardless face recognition result(error, too low), app continues clock in/out
                        console.log(data);
                        $mdDialog.hide(true);
                        timeTrackingService.punchTime(data);
                    }, function (error) {
                        blockUI.stop();
                        // Error to upload to S3
                        console.log(error);
                        $mdDialog.hide(false);
                    });
                };
            }
        };


    }]);
})();