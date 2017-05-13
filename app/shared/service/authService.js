//ng-annotate
timeTrackingApp.factory("AuthService", ["localStorageService", "$http", "$q", "ENV_VARS", "companyModel", function(localStorageService, $http, $q, ENV_VARS, companyModel) {
    var currentUser;

    function serializeData( data ) {
        // If this is not an object, defer to native stringification.
        if ( ! angular.isObject( data ) ) {
            return( ( data === null ) ? "" : data.toString() );
        }

        var buffer = [];

        // Serialize each key in the object.
        for ( var name in data ) {
            if ( ! data.hasOwnProperty( name ) ) {
                continue;
            }

            var value = data[ name ];

            buffer.push(
                encodeURIComponent( name ) + "=" + encodeURIComponent( ( value === null ) ? "" : value )
            );
        }

        // Serialize the buffer and clean it up for transportation.
        var source = buffer.join( "&" ).replace( /%20/g, "+" );
        return( source );
    }

    return {
        login : function(username, password) {
            var defer= $q.defer();

            localStorageService.set("username", username);
            localStorageService.set("password", password);

            var requestData = serializeData({"email": username, "password":password});

            $http({
                url: ENV_VARS.BASEURL + "user/auth/",
                method: "POST",
                data:requestData,
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
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