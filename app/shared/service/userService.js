//ng-annotate
timeTrackingApp.factory("userService", ["$q", "$http", "userModel", "StageBASEURL", "companyModel", "$state", function($q, $http, userModel, StageBASEURL, companyModel, $state){
    return {
        pinLogin: function (pin) {
            if(companyModel.getCompanyID() === false) {
                $state.go("login");
                return false;
            }
            var defer= $q.defer();

            $http({
                url:  StageBASEURL+ "company/"+ companyModel.getCompanyID() + "/pin/" + pin +"/employee_profile",
                method: "GET",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
                }
            }).then(function(response){
                userModel.setCurrentUser(response.data);
                defer.resolve(response);
            }, function(error){
                console.log(error);
                defer.reject(error);
            });

            return defer.promise;
        },

        /*
         * Not supported for beta
         */
        updateProfile: function () {
            var defer=$q.defer();

            $http({
                url: StageBASEURL + "employee_profile/BMHT_3_babf7c42f76af6f81486d76ff6e33505",
                method: "PUT",
                data: {
                    "pin" :"888888",
                    "person":  "BMHT_3_babf7c42f76af6f81486d76ff6e33505",
                    "company" : "BMHT_1_b457df460695969e8960e3f1623a3ee7"
                },
                headers: {
                    "Content-Type": "application/json"
                }
            }).then(function(response){
                console.log(response);
                defer.resolve(response);
            },function(error){
                defer.reject(error);
                console.log(error);
            });

            return defer.promise;
        }

    };
}]);