//ng-annotate
timeTrackingApp.controller("LoginCtrl", ["$scope", "$http", "localStorageService", "$state", "AuthService", function ($scope, $http, localStorageService, $state, AuthService) {
    $scope.formSubmit = function() {
        $scope.isLoginLoading = true;
        AuthService.login($scope.email, $scope.password).then(function() {
            $scope.isLoginLoading = false;
            $state.go("pinLogin");
        }, function () {
            $scope.isLoginLoading = false;
            $scope.error = "Incorrect username/password !";
            $scope.password = "";
        });
    };
}]);