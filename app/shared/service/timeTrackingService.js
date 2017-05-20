//ng-annotate
timeTrackingApp.factory("timeTrackingService", ["localStorageService", "$http", "$q", "$httpParamSerializer", "ENV_VARS", "userModel", "companyModel", function(localStorageService, $http, $q, $httpParamSerializer, ENV_VARS, userModel, companyModel) {
    return {
        punchTime: function(data) {
            var lastStatus = localStorageService.get("lastStatus");
            if(lastStatus !== null && lastStatus.length > 0){
                return this.clockOut(data);
            } else {
                return this.clockIn(data);
            }
        },

        clockIn: function(data) {
            var currentUser = userModel.getCurrentUser();
            var defer= $q.defer();

            var dateISO = new Date().toISOString();

            var requestData = {
                "date" : dateISO,
                "start" : dateISO,
                "createdTimestamp": dateISO,
                "inHours": false,
                "recordType" : "Work Time",
                "employee": {
                    "email" :  userModel.getUserEmail(),
                    "lastName" : userModel.getCurrentUserFisrtName(),
                    "firstName" : currentUser.last_name,
                    "companyDescriptor" : ENV_VARS.ENV_PRE + companyModel.getCompanyID(),
                    "personDescriptor" : ENV_VARS.ENV_PRE + currentUser.person.user
                },
                "checkInAssets": {
                    "imageDetectionAsset": {
                        "referenceImageAsset": {
                            "url": userModel.getGoldenPhoto(),
                            "bucketName": ENV_VARS.IMAGE_S3_BUCKET
                        },
                        "realTimeImageAsset": {
                            "url": data.url,
                            "bucketName": ENV_VARS.IMAGE_S3_BUCKET
                        },
                        "confidence": data.confidence
                    }
                },
                "inProgress": "true"
            };

            $http({
                url: ENV_VARS.DemoTimeServiceURL + "time_punch_cards",
                method: "POST",
                data:requestData,
                headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                }
            }).then(function(response){
                currentUser.clockIn = true;
                currentUser.clockInId = response.data._id;
                userModel.updateUser(currentUser);
                defer.resolve(response);
            },function(error){
                defer.reject(error);
            });

            return defer.promise;
        },

        clockOut: function(data) {
            var currentUser = userModel.getCurrentUser();
            var defer= $q.defer();

            var dateISO = new Date().toISOString();

            var requestData = {
                "date" : dateISO,
                "recordType" : "Work Time",
                "employee": {
                    "email" :  userModel.getUserEmail(),
                    "lastName" : userModel.getCurrentUserFisrtName(),
                    "firstName" : currentUser.last_name,
                    "companyDescriptor" : ENV_VARS.ENV_PRE + companyModel.getCompanyID(),
                    "personDescriptor" : ENV_VARS.ENV_PRE + currentUser.person.user
                },
                "end" : dateISO,
                "checkOutAssets": {
                    "imageDetectionAsset": {
                        "referenceImageAsset": {
                            "url": userModel.getGoldenPhoto(),
                            "bucketName": ENV_VARS.IMAGE_S3_BUCKET
                        },
                        "realTimeImageAsset": {
                            "url": data.url,
                            "bucketName": ENV_VARS.IMAGE_S3_BUCKET
                        },
                        "confidence": data.confidence
                    }
                },
                "inProgress": "false"
            };

            var lastStatus = localStorageService.get("lastStatus");

            $http({
                url: ENV_VARS.DemoTimeServiceURL+ "time_punch_cards/" + lastStatus[0]._id,
                method: "PUT",
                data:requestData,
                headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                }
            }).then(function(response){
                currentUser.clockIn = null;
                currentUser.clockInId = null;
                localStorageService.set("lastStatus", null);
                userModel.updateUser(currentUser);
                defer.resolve(response);
            },function(error){
                currentUser.clockIn = null;
                currentUser.clockInId = null;
                defer.reject(error);
            });

            return defer.promise;
        },

        getUserLatestTimeCardStatus: function() {
            var currentUser = userModel.getCurrentUser();
            $http({
                url: ENV_VARS.DemoTimeServiceURL+ "employee/" + ENV_VARS.ENV_PRE +currentUser.person.user + "/time_punch_cards?inprogress=true",
                method: "GET"
            }).then(function(response){
                localStorageService.set("lastStatus", response.data);
            },function(error){
            });
        }
    };
}]);