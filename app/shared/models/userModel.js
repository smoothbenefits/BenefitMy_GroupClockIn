//ng-annotate
timeTrackingApp.factory("userModel", ["localStorageService", function(localStorageService){
    var user = {};
    return {
        getGoldenPhotoID: function () {
            user = localStorageService.get("currentUserProfile");
            var photoUrl = user.photo_url;
            var id = photoUrl.substr(photoUrl.indexOf("s3.amazonaws.com/") + 17, photoUrl.length);
            return id;
        },

        getGoldenPhoto: function () {
            user = localStorageService.get("currentUserProfile");
            return user.photo_url;
        },

        getUserName: function () {
            user = localStorageService.get("currentUserProfile");
            return user.person.first_name + " " + user.person.last_name;
        },

        getUserProfile: function () {
            user = localStorageService.get("currentUserProfile");

            if(user === null) return false;

            return user;
        },

        getUserID: function () {
            user = localStorageService.get("currentUserProfile");

            if(user === null) return false;

            return user.id;
        },

        getUserEmail: function () {
            user = localStorageService.get("currentUserProfile");

            if(user === null) return false;

            return user.person.email;
        },

        getCompanyID: function () {
            user = localStorageService.get("currentUserProfile");

            if(user === null) return false;

            return user.company;
        },

        clearCurrentUser: function () {
            localStorageService.set("currentUserProfile", null);
        },

        setCurrentUser: function (userProfile) {
            var existingUsers = JSON.parse(localStorageService.get("users"));
            if(existingUsers === null) existingUsers = [];

            var result = existingUsers.filter(function( obj ) {
                return obj.id === userProfile.id;
            });

            if(result.length === 0) {
                existingUsers.push(userProfile);
                localStorageService.set("users", JSON.stringify(existingUsers));
            } else {
                if(result[0].hasOwnProperty("clockIn")) {
                    userProfile.clockIn = result[0].clockIn;
                    userProfile.clockInId = result[0].clockInId;
                }
                if(userProfile.hasOwnProperty("photo_url")) {

                }
            }

            localStorageService.set("currentUserProfile", userProfile);
        },

        hasGoldenPhoto: function () {
            return this.getGoldenPhoto() !== null && this.getGoldenPhoto() !== "";
        },

        isCurrentUserClockIn: function () {
            var userLastStatus = localStorageService.get("lastStatus");
            return (userLastStatus !== null && userLastStatus.length > 0);
        },

        getCurrentUser: function () {
            return localStorageService.get("currentUserProfile");
        },

        updateUser: function (updatedProfile) {
            var existingUsers = JSON.parse(localStorageService.get("users"));
            if(existingUsers === null) existingUsers = [];

            existingUsers = existingUsers.map(function(user) { return user.id === updatedProfile.id ? updatedProfile : user; });

            localStorageService.set("users", JSON.stringify(existingUsers));
        },

        getCurrentUserFisrtName: function () {
            user = localStorageService.get("currentUserProfile");

            if(user === null) return false;

            return user.person.first_name;
        }


    };
}]);