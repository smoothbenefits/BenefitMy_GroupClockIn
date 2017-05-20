//ng-annotate
timeTrackingApp
    .factory("faceRecognitionService", ["$http", "$q", "userModel", "localStorageService", "timeTrackingService", "companyModel", "ENV_VARS", function($http, $q, userModel, localStorageService, timeTrackingService, companyModel, ENV_VARS) {

        AWS.config.update({ accessKeyId: ENV_VARS.AWSAccessKeyId, secretAccessKey: ENV_VARS.AWSSecretAccessKey });
        AWS.config.region = "us-east-1";

        var rekognition = new AWS.Rekognition();

        var bucket = new AWS.S3({ params: { Bucket: ENV_VARS.IMAGE_S3_BUCKET }});

        function dataURItoBlobHelper(dataURI) {
            var binary = atob(dataURI.split(",")[1]);
            var array = [];
            for(var i = 0; i < binary.length; i++) {
                array.push(binary.charCodeAt(i));
            }
            return new Blob([new Uint8Array(array)], {type: "image/jpeg"});
        }

        function generateUUIDHelper() {
            var d = new Date().getTime();
            var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c==="x" ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        }

        return {
            uploadImage: function (imageData) {
                var blobData = dataURItoBlobHelper(imageData);

                var params = {Key: generateUUIDHelper(), Body: blobData, ContentType: "image/jpeg"};
                var defer=$q.defer();

                bucket.upload(params, function(err, data) {
                    if(err) {
                        defer.reject(err);
                        console.log(err);
                    } else {
                        defer.resolve(data);
                    }
                });

                return defer.promise;
            },

            /*
             * upload golden image for the first time
             */
            uploadGoldenPicture: function (imageData) {
                var defer=$q.defer();

                var promise = this.uploadImage(imageData).then(function(data){
                    var photoUrl = data.Location;

                    var requestData = userModel.getUserProfile();

                    //modify request data
                    requestData.photo_url = photoUrl;
                    requestData.person = requestData.person.id;
                    requestData.company = companyModel.getCompanyID();
                    if(requestData.manager !== null && requestData.manager.hasOwnProperty("id"))
                        requestData.manager = requestData.manager.id;
                    else
                        requestData.manager = null;

                    timeTrackingService.punchTime(data);

                    $http({
                        url: ENV_VARS.BASEURL +"employee_profile/" + userModel.getUserID(),
                        method: "PUT",
                        data: requestData,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }).then(function(response){
                        console.log(response);
                        userModel.setCurrentUser(response.data);
                        defer.resolve(response);
                    },function(error){
                        defer.reject(error);
                        console.log(error);
                    });
                }, function (error) {
                    //error to upload S3 image
                    defer.reject(error);
                    console.log(error);
                });

                return defer.promise;
            },

            /*
             *
             */
            getRecognitionResult: function (imageData){
                var defer=$q.defer();

                var promise = this.uploadImage(imageData).then(function(data){

                    var photoUrl = data.Location;
                    var params = {
                        SimilarityThreshold: 0,
                        SourceImage: {
                            S3Object: {
                                Bucket: ENV_VARS.IMAGE_S3_BUCKET,
                                Name: userModel.getGoldenPhotoID()
                            }
                        },
                        TargetImage: {
                            S3Object: {
                                Bucket: ENV_VARS.IMAGE_S3_BUCKET,
                                Name: data.key
                            }
                        }
                    };

                    rekognition.compareFaces(params, function (err, data) {
                        if (err) {
                            defer.resolve({
                                url:photoUrl,
                                confidence: null
                            });
                        }
                        else {
                            defer.resolve({
                                url:photoUrl,
                                confidence: data.FaceMatches[0].Similarity
                            });
                        }
                    });
                });

                return defer.promise;
            }

        };
    }]);