//ng-annotate
timeTrackingApp.factory("timeTrackingService",
["localStorageService", "$http", "$q", "$httpParamSerializer", "envService", "userModel", "companyModel",
function(localStorageService, $http, $q, $httpParamSerializer, envService, userModel, companyModel) {

    var environmentPrefix = envService.read('EnvironmentPrefix');
    var s3BucketUri = envService.read('ImageS3Bucket');
    var timeTrackingUrl = envService.read('TimeTrackingServiceUrl');

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
            var attributes = [];
            if(localStorageService.get("location_state") !== null) {
                attributes.push({
                    "name": "State",
                    "value": localStorageService.get("location_state")
                });
            }

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
                    "companyDescriptor" : environmentPrefix + companyModel.getCompanyID(),
                    "personDescriptor" : environmentPrefix + currentUser.person.user
                },
                "checkInAssets": {
                    "imageDetectionAsset": {
                        "referenceImageAsset": {
                            "url": userModel.getGoldenPhoto(),
                            "bucketName": s3BucketUri
                        },
                        "realTimeImageAsset": {
                            "url": data.url,
                            "bucketName": s3BucketUri
                        },
                        "confidence": data.confidence
                    }
                },
                "attributes": attributes,
                "inProgress": "true"
            };

            $http({
                url: timeTrackingUrl + "time_punch_cards",
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
            var attributes = [];
            if(localStorageService.get("location_state") !== null) {
                attributes.push({
                    "name": "State",
                    "value": localStorageService.get("location_state")
                });
            }

            var requestData = {
                "date" : dateISO,
                "recordType" : "Work Time",
                "employee": {
                    "email" :  userModel.getUserEmail(),
                    "lastName" : userModel.getCurrentUserFisrtName(),
                    "firstName" : currentUser.last_name,
                    "companyDescriptor" : environmentPrefix + companyModel.getCompanyID(),
                    "personDescriptor" : environmentPrefix + currentUser.person.user
                },
                "end" : dateISO,
                "checkOutAssets": {
                    "imageDetectionAsset": {
                        "referenceImageAsset": {
                            "url": userModel.getGoldenPhoto(),
                            "bucketName": s3BucketUri
                        },
                        "realTimeImageAsset": {
                            "url": data.url,
                            "bucketName": s3BucketUri
                        },
                        "confidence": data.confidence
                    }
                },
                "attributes": attributes,
                "inProgress": "false"
            };

            var lastStatus = localStorageService.get("lastStatus");

            $http({
                url: timeTrackingUrl+ "time_punch_cards/" + lastStatus[0]._id,
                method: "PUT",
                data:requestData,
                headers: {
                    "Content-Type": "application/json;charset=UTF-8"
                }
            }).then(function(response){
                currentUser.clockIn = null;
                currentUser.clockInId = null;
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
                url: timeTrackingUrl+ "employee/" + environmentPrefix +currentUser.person.user + "/time_punch_cards?inprogress=true",
                method: "GET"
            }).then(function(response){
                localStorageService.set("lastStatus", response.data);
            },function(error){
            });
        }
    };
}]);
