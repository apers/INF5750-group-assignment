'use strict';
var module = angular.module('overdressed', [
    'ngRoute',
    'overdressed.messaging.controllers',
    'overdressed.messaging.directives',
    'overdressed.messaging.filters',
    'overdressed.messaging.services'
]);


module.config(function($routeProvider, $httpProvider) {
    // send to index page if unknown url
    $routeProvider.otherwise({
        redirectTo: '/'
    });

    // workaround for API bug for catching 401
    // TODO: change when API get fixed and sends 401
    console.log("prov", $httpProvider);
    $httpProvider.interceptors.push(function($window) {
        return {
            'response': function (response) {
                if (typeof response.data == 'string' && response.data.indexOf('class="loginPage"') != -1) {
                    // only redirect if we were pulling data, not pushing
                    if (response.config.method == 'GET') {
                        $window.location.href = '/';
                    } else {
                        alert("You are not signed in and cannot perform this action.");
                    }
                    return $q.reject(response);
                }

                return response;
            }
        }
    });
});
