(function() {
    'use strict';

    var module = angular.module('overdressed.messaging.controllers.PageController', [

    ]);

    module.controller('PageController', function ($scope, $window, $location, $rootScope, OfflineConversation) {
        // offline stuff
        (function() {
            //Check if we lost connection to the internet
            console.log("initial offline state", !navigator.onLine);
            $rootScope.offline = !navigator.onLine;
            $window.addEventListener("offline", function () {
                $rootScope.$apply(function () {
                    console.log("offline", true);
                    $rootScope.offline = true;
                });
            }, false);
            $window.addEventListener("online", function () {
                $rootScope.$apply(function () {
                    console.log("offline", false);
                    $rootScope.offline = false;
                });
            }, false);
        })();

        // detect url changes
        (function() {
            $rootScope.location = $location.path();
            $window.addEventListener("hashchange", function () {
                $rootScope.$apply(function () {
                    $rootScope.location = $location.path();
                });
            }, false);
        })();

        // hide menu on menu item click
        (function() {
            $(document).ready(function () {
                $("#navbar li a").click(function () {
                    $(".navbar-collapse").removeClass("in");
                });
            });
        })();

        // expose offline data information
        (function() {
            $scope.isWaiting = OfflineConversation.isWaiting;
        })();

    });
})();
