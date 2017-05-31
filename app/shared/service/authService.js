//ng-annotate
timeTrackingApp.factory("AuthService",
["localStorageService", "$http", "$q", "envService", "companyModel",
function(localStorageService, $http, $q, envService, companyModel) {
    var currentUser;
    var mainAppBaseUrl = envService.read('WorkBenefitsMeUrl');

    return {
        login : function(username, password) {
            var defer= $q.defer();

            localStorageService.set("username", username);
            localStorageService.set("password", password);

            var requestData = {"email": username, "password":password};

            $http({
                url: mainAppBaseUrl + "user/auth/",
                method: "POST",
                data:requestData,
                headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                }
            }).then(function(response){
                console.log(response);
                localStorageService.set("isLogin", true);
                companyModel.setCompanyProfile(response.data);
                defer.resolve(response);
            },function(error){
                defer.reject(error);
                localStorageService.set("isLogin", false);
                console.log(error);
            });

            return defer.promise;
        },
        reAuth : function() {
            var username = localStorageService.get("username");
            var password = localStorageService.get("password");
            console.log(username+password);
            return this.login(username, password);
        },
        isLogin : function () {
            var isLogin = localStorageService.get("isLogin");
            var companyID = companyModel.getCompanyID();

            return !((isLogin === null || isLogin === false) || (companyID === null));
        }
    };
}]);
