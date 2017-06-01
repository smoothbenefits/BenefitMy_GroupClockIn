//ng-annotate
timeTrackingApp.factory("userService",
["$q", "$http", "userModel", "envService", "companyModel", "$state",
function($q, $http, userModel, envService, companyModel, $state){

    var mainAppUrl = envService.read('WorkBenefitsMeUrl');
    return {
        pinLogin: function (pin) {
            if(companyModel.getCompanyID() === false) {
                $state.go("login");
                return false;
            }
            var defer= $q.defer();

            $http({
                url: mainAppUrl + "company/"+ companyModel.getCompanyID() + "/pin/" + pin +"/employee_profile",
                method: "GET",
                headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                }
            }).then(function(response){
                userModel.setCurrentUser(response.data);
                defer.resolve(response);
            }, function(error){
                console.log(error);
                defer.reject(error);
            });

            return defer.promise;
        }
    };
}]);
