//ng-annotate
timeTrackingApp.factory("companyModel", ["localStorageService", function(localStorageService){
    return {
        setCompanyProfile: function (companyProfile) {
            localStorageService.set("companyProfile", companyProfile);
        },

        getCompanyID: function () {
            var company = localStorageService.get("companyProfile");

            if(company === null) return false;

            var encodedInfo = company.company_info.company_id_env_encode;
            var res = encodedInfo.substr(encodedInfo.indexOf("_") + 1, encodedInfo.length);
            return res;
        }

    };
}]);