//ng-annotate
timeTrackingApp.controller("PinLoginCtrl", ["$scope", "$state", "$location", "$mdDialog", "userService", "userModel", "AuthService", "timeTrackingService", "localStorageService",
    function($scope, $state, $location, $mdDialog, userService, userModel, AuthService, timeTrackingService, localStorageService) {
    var input   = "";

    userModel.clearCurrentUser();

    var numbers = document.querySelectorAll(".num-pad");
    numbers = Array.prototype.slice.call(numbers);

    numbers.forEach(function(number, index) {
        number.addEventListener("mousedown", function() {
            switch(true) {
                case (index < 9):
                    input += (index+1);
                    break;
                case (index === 10):
                    input += 0;
                    break;
            }

            $scope.$apply(function(){
                    document.getElementById("input_field").className += " text-animation";
                    $scope.pin_input = input;

                    setTimeout(function() {
                        document.getElementById('input_field').classList.remove('text-animation');
                    }, 200);
                }
            );
        });
    });

    $scope.pinDone = function() {
        $scope.isLoading = true;

        if(input === "1234567890" ) {
            localStorageService.clearAll();
            $state.go("login");
            window.location.reload(true);
            return true;
        }

        if(!AuthService.isLogin()) {
            $scope.isLoading = false;
            $state.go("login");
            return true;
        }

        userService.pinLogin(input).then(function () {
            timeTrackingService.getUserLatestTimeCardStatus();

            setTimeout(function() {
                $state.go("capture");
            }, 1500);
        }, function (error) {
            $scope.isLoading = false;

            console.log(error);

            var errorMessage = {
                "-1": "No Internet! Please make sure device connect to WIFI. try again!",
                "400": "Your pin: " + input +" is invalid! Please try again!",
                "404": "Your pin: " + input +" is invalid! Please try again!",
                "500": "Service Error. Please try again!"
            };

            var displayMessage = "undefined" === typeof errorMessage[error.status] ? "Please try again!" : errorMessage[error.status];

            $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title("Error Message")
                    .textContent(displayMessage)
                    .ok('Okay!')
            ).finally(function () {
                input = "";
                $scope.pin_input = input;
            });
        });
    };

    $scope.pinBackspace = function () {
        input = input.slice(0, -1);
        $scope.pin_input = input;
    };


}]);