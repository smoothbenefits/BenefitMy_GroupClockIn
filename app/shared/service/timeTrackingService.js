//ng-annotate
timeTrackingApp.factory("timeTrackingService", ["localStorageService", "$http", "$q", "$httpParamSerializer", "StageBASEURL", "userModel", "companyModel", "DemoTimeServiceURL", function(localStorageService, $http, $q, $httpParamSerializer, StageBASEURL, userModel, companyModel, DemoTimeServiceURL) {
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
                "recordType" : "Work Time",
                "employee": {
                    "email" : "stage_" + userModel.getUserEmail(),
                    "companyDescriptor" : "stage_" + companyModel.getCompanyID(),
                    "personDescriptor" : "stage_" + userModel.getUserID()
                },
                "start" : dateISO,
                "checkInAssets": {
                    "imageDetectionAsset": {
                        "referenceImageAsset": {
                            "url": userModel.getGoldenPhoto(),
                            "bucketName": "benefitmy-staging-profile-assets"
                        },
                        "realTimeImageAsset": {
                            "url": data.url,
                            "bucketName": "benefitmy-staging-profile-assets"
                        },
                        "confidence": data.confidence
                    }
                },
                "inProgress": "true"
            };

            $http({
                url: DemoTimeServiceURL + "time_punch_cards",
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
                    "email" : "stage_" + userModel.getUserEmail(),
                    "companyDescriptor" : "stage_" + companyModel.getCompanyID(),
                    "personDescriptor" : "stage_" + userModel.getUserID()
                },
                "end" : dateISO,
                "checkOutAssets": {
                    "imageDetectionAsset": {
                        "referenceImageAsset": {
                            "url": "benefitmy-staging-profile-assets",
                            "bucketName": "benefitmy-staging-profile-assets"
                        },
                        "realTimeImageAsset": {
                            "url": data.url,
                            "bucketName": "benefitmy-staging-profile-assets"
                        },
                        "confidence": data.confidence
                    }
                },
                "inProgress": "false"
            };

            var lastStatus = localStorageService.get("lastStatus");

            $http({
                url: DemoTimeServiceURL+ "time_punch_cards/" + lastStatus[0]._id,
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
                url: DemoTimeServiceURL+ "employee/" + "stage_"+currentUser.person.id + "/time_punch_cards?inprogress=true",
                method: "GET"
            }).then(function(response){
                localStorageService.set("lastStatus", response.data);
            },function(error){
            });
        }
    };
}]);