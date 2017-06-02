//ng-annotate
timeTrackingApp.controller("PinLoginCtrl", ["$scope", "$state", "$location", "$mdDialog", "userService", "userModel", "AuthService", "timeTrackingService", function($scope, $state, $location, $mdDialog, userService, userModel, AuthService, timeTrackingService) {
    var input   = "";

    userModel.clearCurrentUser();

    var numbers = document.querySelectorAll(".num");
    numbers = Array.prototype.slice.call(numbers);

    numbers.forEach(function(number, index) {
        number.addEventListener("click", function() {
            switch(true) {
                case (index < 9):
                    input += (index+1);
                    break;
                case (index === 9):
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

            //TODO we can show different error depending on response code
            $mdDialog.show(
                $mdDialog.alert()
                    .clickOutsideToClose(true)
                    .title("Error Message")
                    .textContent("Invalid Pin! Error Code:" + error.status)
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