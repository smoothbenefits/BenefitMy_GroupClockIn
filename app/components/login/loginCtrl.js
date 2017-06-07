//ng-annotate
timeTrackingApp.controller("LoginCtrl", ["$scope", "$http", "localStorageService", "$state", "AuthService", function ($scope, $http, localStorageService, $state, AuthService) {
    $scope.userState = 'MA';
    $scope.states = ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
    'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
    'WY').split(' ').map(function (state) { return { abbrev: state }; });

    $scope.formSubmit = function() {
        $scope.isLoginLoading = true;

        AuthService.login($scope.email, $scope.password).then(function() {
            $scope.isLoginLoading = false;
            localStorageService.set("location_state", $scope.userState);
            $state.go("pinLogin");
        }, function () {
            $scope.isLoginLoading = false;
            $scope.error = "Incorrect username/password !";
            $scope.password = "";
        });

    };
}]);