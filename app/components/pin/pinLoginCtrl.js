//ng-annotate
timeTrackingApp.controller("PinLoginCtrl", ["$scope", "$state", "$location", "$mdToast", "userService", "userModel", "AuthService", "timeTrackingService", function($scope, $state, $location, $mdToast, userService, userModel, AuthService, timeTrackingService) {
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
            $state.$apply();
            return true;
        }

        userService.pinLogin(input).then(function () {
            timeTrackingService.getUserLatestTimeCardStatus();

            setTimeout(function() {
                $state.go("capture");
            }, 1500);
        }, function () {
            $scope.isLoading = false;

            $mdToast.show(
                $mdToast.simple().content("Invalid Pin!").theme("error-toast")
            );

            input = "";
            $scope.pin_input = input;
        });
    };

    $scope.pinBackspace = function () {
        input = input.slice(0, -1);
        $scope.pin_input = input;
    };


}]);